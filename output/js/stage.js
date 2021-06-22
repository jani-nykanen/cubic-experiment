import { ShapeGenerator } from "./shapegen.js";
export class Stage {
    constructor(stageIndex, event) {
        this.baseMap = event.assets.getTilemap(String(stageIndex));
        this.width = this.baseMap.width;
        this.depth = this.baseMap.height;
        this.height = this.baseMap.max(0);
        this.heightMap = this.baseMap.cloneLayer(0);
        this.createTerrainMesh(event);
    }
    createTerrainMesh(event) {
        let shapeGen = new ShapeGenerator();
        for (let z = 0; z < this.depth; ++z) {
            for (let x = 0; x < this.width; ++x) {
                shapeGen.addHorizontalPlane(x, this.heightMap[(this.depth - 1 - z) * this.width + x], z, 1, 1, 1);
            }
        }
        this.terrain = shapeGen.generateMesh(event);
    }
    setCameraCenter(canvas) {
        canvas.transform.translate(-this.width / 2, -this.height / 2, -this.depth / 2);
        canvas.transform.use();
    }
    draw(canvas) {
        canvas.transform.push();
        canvas.transform.use();
        canvas.setDrawColor();
        canvas.drawMesh(this.terrain);
        canvas.transform.pop();
    }
}
