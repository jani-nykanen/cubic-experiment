import { Canvas } from "./core/canvas.js";
import {  CoreEvent } from "./core/core.js";
import { Mesh } from "./core/mesh.js";
import { Tilemap } from "./core/tilemap.js";
import { Vector2, Vector3 } from "./core/vector.js";
import { ObjectManager } from "./objectmanager.js";
import { ShapeGenerator } from "./shapegen.js";


export enum TileEffect {

    None = 0,
    StarObtained = 1,
    ButtonPressed = 2,
};



export class Stage {


    private baseMap : Tilemap;

    private width : number;
    private height : number;
    private depth : number;

    private heightMap : Array<number>;
    private objectLayer : Array<number>;

    private terrain : Mesh;
    private starShape : Mesh;
    private starShadow : Mesh;
    private button : Mesh;
    private cross : Mesh;
    private specialWall : Mesh;

    private starAngle : number;


    constructor(stageIndex : number, event : CoreEvent) {

        this.baseMap = event.assets.getTilemap(String(stageIndex));

        this.width = this.baseMap.width;
        this.depth = this.baseMap.height;
        this.height = this.baseMap.max(0);

        this.heightMap = this.baseMap.cloneLayer(0);
        this.objectLayer = this.baseMap.cloneLayer(1);

        this.createTerrainMesh(event);

        let gen = new ShapeGenerator();

        this.starShape = gen.generateStar(0.50, 0.5, 5, event);
        this.button = gen.generateCylinderFromPath(
            t => new Vector2(0.5*Math.cos(t * Math.PI*2), 0.5*Math.sin(t * Math.PI*2)), 
            32, 1.0, event);

        this.generateStarShadow(event);

        this.cross = gen.addHorizontalPlane(-0.5, 0, -0.1, 1.0, 0.2, 1)    
            .addHorizontalPlane(-0.1, 0, -0.5, 0.2, 1.0, 1)
            .generateMesh(event);

        this.specialWall = gen.addHorizontalPlane(-0.5, 0.0, -0.5, 1, 1, 1)
            .addVerticalPlaneXY(-0.5, -1.0, -0.5, 1.0, 1.0)
            .addVerticalPlaneXZ(0.5, -1.0, -0.5, 1.0, 1.0)
            .generateMesh(event);

        this.starAngle = 0;
    }


    public reset() {

        this.heightMap = this.baseMap.cloneLayer(0);
        this.objectLayer = this.baseMap.cloneLayer(1);

        this.starAngle = 0;
    }


    private generateStarShadow(event : CoreEvent) {

        const SCALE = 0.90;

        let gen = new ShapeGenerator();

        let x = 0.5 * SCALE;
        let y = -0.5+0.0015;
        let z = 0.25 * SCALE;

        gen.addTriangle(
            new Vector3(x, y, 0),
            new Vector3(0, y, -z),
            new Vector3(0, y, z)
        );

        gen.addTriangle(
            new Vector3(-x, y, 0),
            new Vector3(0, y, -z),
            new Vector3(0, y, z), 1
        );

        this.starShadow = gen.generateMesh(event);
    }


    private createTerrainMesh(event : CoreEvent) {

        const BOTTOM_HEIGHT = 0.5;

        let shapeGen = new ShapeGenerator();
        let height : number;
        let height2 : number;
        
        for (let z = 0; z < this.depth; ++ z) {

            for (let x = 0; x < this.width; ++ x) {

                height = this.heightMap[(this.depth-1 - z)*this.width+x];

                shapeGen.addHorizontalPlane(
                    x, height, z, 1, 1, 1
                );

                if (height > 0) {

                    if (z > 0)
                        height2 = this.heightMap[(this.depth-1 - (z-1))*this.width+x];
                    else 
                        height2 = 0;
                    
                    if (height2 < height) {

                        shapeGen.addVerticalPlaneXY(x, height, z, 1, -(height-height2));
                    }   
                }

                if (height > 0) {

                    if (x < this.width-1)
                        height2 = this.heightMap[(this.depth-1 - z)*this.width+(x+1)];
                    else
                        height2 = 0;

                    if (height2 < height) {

                        shapeGen.addVerticalPlaneXZ(x+1, height, z, 1, -(height-height2));
                    }   
                }
            }
        }

        shapeGen.addVerticalPlaneXY(0, -BOTTOM_HEIGHT, 0, this.width, BOTTOM_HEIGHT);
        shapeGen.addVerticalPlaneXZ(this.width, -BOTTOM_HEIGHT, 0, this.depth, BOTTOM_HEIGHT);

        this.terrain = shapeGen.generateMesh(event);
    }


    public update(event : CoreEvent) {

        const STAR_ROTATE_SPEED = 0.05;

        this.starAngle = (this.starAngle + STAR_ROTATE_SPEED*event.step) % (Math.PI*2);
    }


    private drawStar(canvas : Canvas, x : number, y : number, z : number) {

        let angle = this.starAngle;
        if (x % 2 == z % 2)
            angle += Math.PI/2;

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


    private drawButton(canvas : Canvas, x : number, y : number, z : number, pressed = false) {

        const SCALE_Y = [0.33, 0.05];
        const BASE_SCALE = 0.80;

        canvas.transform.push();
        canvas.transform.translate(x + 0.5, y, z + 0.5);
        canvas.transform.scale(BASE_SCALE, SCALE_Y[Number(pressed)], BASE_SCALE);
        canvas.transform.use();

        canvas.setDrawColor(1.0, 0.33, 1.0);
        canvas.drawMesh(this.button);

        canvas.transform.pop();

        canvas.setDrawColor();
    }


    private drawSpecialWall(canvas : Canvas, x : number, y : number, z : number, enabled = false) {

        const BASE_SCALE = 0.80;

        canvas.transform.push();
        canvas.transform.translate(x + 0.5, y, z + 0.5);
        
        if (enabled) {

            canvas.transform.use();
            canvas.setDrawColor(0.67, 0.67, 1.0);
            canvas.drawMesh(this.specialWall);
        }

        canvas.transform.translate(0, 0.005, 0);
        canvas.transform.rotate(Math.PI/4, new Vector3(0, 1, 0));
        canvas.transform.scale(BASE_SCALE, BASE_SCALE, BASE_SCALE);
        canvas.transform.use();

        canvas.setDrawColor(1.0, 0.33, 1.0);
        canvas.drawMesh(this.cross);

        canvas.transform.pop();

        canvas.setDrawColor();
    }


    private drawStaticObjects(canvas : Canvas) {

        let tid : number;
        let y : number;
        let dz : number;

        for (let z = 0; z < this.depth; ++ z) {

            for (let x = 0; x < this.width; ++ x) {

                tid = this.objectLayer[z * this.width + x];
                if (tid == 0) continue;
            
                y = this.getHeight(x, z);

                dz = this.depth-1 - z;

                switch (tid) {

                // Star
                case 10:
                    this.drawStar(canvas, x, y, dz);
                    break;

                // Button
                case 11:
                case 257:
                    this.drawButton(canvas, x, y, dz, tid == 257);
                    break;

                // Special wall
                case 12:
                case 13:

                    this.drawSpecialWall(canvas, x, y, dz, tid == 13);
                    break;

                default:
                    break;
                }
            }
        }
    }


    public draw(canvas : Canvas) {

        canvas.transform.push();
        canvas.transform.translate(0, 0, -this.depth);
        canvas.transform.use();

        canvas.setDrawColor();
        canvas.drawMesh(this.terrain);

        this.drawStaticObjects(canvas);

        canvas.transform.pop();
    }


    public parseObjectLayer(objects : ObjectManager, event : CoreEvent) {

        let tid : number;

        for (let z = 0; z < this.depth; ++ z) {

            for (let x = 0; x < this.width; ++ x) {

                tid = this.baseMap.getTile(1, x, z);
                if (tid == 0) continue;

                switch(tid) {

                case 9:

                    objects.createPlayer(x, this.heightMap[z*this.width+x], z, event);
                    break;

                default:
                    break;
                }
            }
        }
    }


    public getHeight(x : number, z : number, offStageValue = 256) {

        if (x < 0 || z < 0 || x >= this.width || z >= this.depth)
            return offStageValue;

        return this.heightMap[z * this.width + x];
    }


    private toggleWalls() {

        for (let i = 0; i < this.objectLayer.length; ++ i) {

            if (this.objectLayer[i] == 257)
                this.objectLayer[i] = 11;

            else if (this.objectLayer[i] == 12) {

                ++ this.heightMap[i];
                this.objectLayer[i] = 13
            }
            else if (this.objectLayer[i] == 13) {

                -- this.heightMap[i];
                this.objectLayer[i] = 12;
            }
        }
    }


    public checkTile(x : number, y : number, z : number, consumeStars = true) : TileEffect {

        let index = z * this.width + x;

        if (this.getHeight(x, z) == y) {

            switch (this.objectLayer[index]) {

            // Star
            case 10:

                this.objectLayer[index] = 0;
                return TileEffect.StarObtained;

            // Button
            case 11:

                this.toggleWalls();
                this.objectLayer[index] = 257;
                return TileEffect.ButtonPressed;

            default:
                break;
            }

        }

        return TileEffect.None;
    }
}
