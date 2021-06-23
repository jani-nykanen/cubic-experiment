import { Vector3 } from "./core/vector.js";
import { ShapeGenerator } from "./shapegen.js";
export var TileEffect;
(function (TileEffect) {
    TileEffect[TileEffect["None"] = 0] = "None";
    TileEffect[TileEffect["StarObtained"] = 1] = "StarObtained";
})(TileEffect || (TileEffect = {}));
;
export class Stage {
    constructor(stageIndex, event) {
        this.baseMap = event.assets.getTilemap(String(stageIndex));
        this.width = this.baseMap.width;
        this.depth = this.baseMap.height;
        this.height = this.baseMap.max(0);
        this.heightMap = this.baseMap.cloneLayer(0);
        this.objectLayer = this.baseMap.cloneLayer(1);
        this.createTerrainMesh(event);
        this.starShape = (new ShapeGenerator())
            .generateStar(0.50, 0.5, 5, event);
        this.generateStarShadow(event);
        this.starAngle = 0;
    }
    generateStarShadow(event) {
        const SCALE = 0.90;
        let gen = new ShapeGenerator();
        let x = 0.5 * SCALE;
        let y = -0.5 + 0.0015;
        let z = 0.25 * SCALE;
        gen.addTriangle(new Vector3(x, y, 0), new Vector3(0, y, -z), new Vector3(0, y, z));
        gen.addTriangle(new Vector3(-x, y, 0), new Vector3(0, y, -z), new Vector3(0, y, z), 1);
        this.starShadow = gen.generateMesh(event);
    }
    createTerrainMesh(event) {
        const BOTTOM_HEIGHT = 0.5;
        let shapeGen = new ShapeGenerator();
        let height;
        let height2;
        for (let z = 0; z < this.depth; ++z) {
            for (let x = 0; x < this.width; ++x) {
                height = this.heightMap[(this.depth - 1 - z) * this.width + x];
                shapeGen.addHorizontalPlane(x, height, z, 1, 1, 1);
                if (height > 0) {
                    if (z > 0)
                        height2 = this.heightMap[(this.depth - 1 - (z - 1)) * this.width + x];
                    else
                        height2 = 0;
                    if (height2 < height) {
                        shapeGen.addVerticalPlaneXY(x, height, z, 1, -(height - height2));
                    }
                }
                if (height > 0) {
                    if (x < this.width - 1)
                        height2 = this.heightMap[(this.depth - 1 - z) * this.width + (x + 1)];
                    else
                        height2 = 0;
                    if (height2 < height) {
                        shapeGen.addVerticalPlaneXZ(x + 1, height, z, 1, -(height - height2));
                    }
                }
            }
        }
        shapeGen.addVerticalPlaneXY(0, -BOTTOM_HEIGHT, 0, this.width, BOTTOM_HEIGHT);
        shapeGen.addVerticalPlaneXZ(this.width, -BOTTOM_HEIGHT, 0, this.depth, BOTTOM_HEIGHT);
        this.terrain = shapeGen.generateMesh(event);
    }
    update(event) {
        const STAR_ROTATE_SPEED = 0.05;
        this.starAngle = (this.starAngle + STAR_ROTATE_SPEED * event.step) % (Math.PI * 2);
    }
    drawStar(canvas, x, y, z) {
        let angle = this.starAngle;
        if (x % 2 == z % 2)
            angle += Math.PI / 2;
        canvas.transform.push();
        canvas.transform.translate(x + 0.5, y + 0.5, z + 0.5);
        canvas.transform.rotate(angle, new Vector3(0, 1, 0));
        canvas.transform.use();
        canvas.setDrawColor(0, 0, 0, 0.33);
        canvas.drawMesh(this.starShadow);
        canvas.setDrawColor(1, 1, 0.33);
        canvas.drawMesh(this.starShape);
        canvas.transform.pop();
        canvas.setDrawColor();
    }
    drawStaticObjects(canvas) {
        let tid;
        let y;
        for (let z = 0; z < this.depth; ++z) {
            for (let x = 0; x < this.width; ++x) {
                tid = this.objectLayer[z * this.width + x];
                if (tid == 0)
                    continue;
                y = this.getHeight(x, z);
                switch (tid) {
                    case 10:
                        this.drawStar(canvas, x, y, this.depth - 1 - z);
                    default:
                        break;
                }
            }
        }
    }
    draw(canvas) {
        canvas.transform.push();
        canvas.transform.translate(0, 0, -this.depth);
        canvas.transform.use();
        canvas.setDrawColor();
        canvas.drawMesh(this.terrain);
        this.drawStaticObjects(canvas);
        canvas.transform.pop();
    }
    parseObjectLayer(objects, event) {
        let tid;
        for (let z = 0; z < this.depth; ++z) {
            for (let x = 0; x < this.width; ++x) {
                tid = this.baseMap.getTile(1, x, z);
                if (tid == 0)
                    continue;
                switch (tid) {
                    case 9:
                        objects.createPlayer(x, this.heightMap[z * this.width + x], z, event);
                        break;
                }
            }
        }
    }
    getHeight(x, z, offStageValue = 256) {
        if (x < 0 || z < 0 || x >= this.width || z >= this.depth)
            return offStageValue;
        return this.heightMap[z * this.width + x];
    }
    checkTile(x, y, z, consumeStars = true) {
        let index = z * this.width + x;
        if (this.getHeight(x, z) == y) {
            switch (this.objectLayer[index]) {
                // Star
                case 10:
                    this.objectLayer[index] = 0;
                    return TileEffect.StarObtained;
            }
        }
        return TileEffect.None;
    }
}
