import { Canvas } from "./core/canvas.js";
import {  CoreEvent } from "./core/core.js";
import { Mesh } from "./core/mesh.js";
import { Tilemap } from "./core/tilemap.js";
import { ObjectManager } from "./objectmanager.js";
import { ShapeGenerator } from "./shapegen.js";



export class Stage {


    private baseMap : Tilemap;

    private width : number;
    private height : number;
    private depth : number;

    private heightMap : Array<number>;

    private terrain : Mesh;


    constructor(stageIndex : number, event : CoreEvent) {

        this.baseMap = event.assets.getTilemap(String(stageIndex));

        this.width = this.baseMap.width;
        this.depth = this.baseMap.height;
        this.height = this.baseMap.max(0);

        this.heightMap = this.baseMap.cloneLayer(0);

        this.createTerrainMesh(event);
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


    public draw(canvas : Canvas) {

        canvas.transform.push();
        canvas.transform.translate(0, 0, -this.depth);
        canvas.transform.use();

        canvas.setDrawColor();
        canvas.drawMesh(this.terrain);

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
                }
            }
        }
    }


    public getHeight(x : number, z : number, offStageValue = 256) {

        if (x < 0 || z < 0 || x >= this.width || z >= this.depth)
            return offStageValue;

        return this.heightMap[z * this.width + x];
    }
}
