import { AssetManager } from "./core/assets.js";
import { Canvas } from "./core/canvas.js";
import { CoreEvent } from "./core/core.js";
import { Mesh } from "./core/mesh.js";
import { Tilemap } from "./core/tilemap.js";
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

        let shapeGen = new ShapeGenerator();

        for (let z = 0; z < this.depth; ++ z) {

            for (let x = 0; x < this.width; ++ x) {

                shapeGen.addHorizontalPlane(
                    x, this.heightMap[(this.depth-1 - z)*this.width+x], z, 1, 1, 1
                );
            }
        }

        this.terrain = shapeGen.generateMesh(event);
    }


    public setCameraCenter(canvas : Canvas) {

        canvas.transform.translate(-this.width/2, -this.height/2, -this.depth/2);
        canvas.transform.use();

    }


    public draw(canvas : Canvas) {

        canvas.transform.push();
        
        canvas.transform.use();

        canvas.setDrawColor();
        canvas.drawMesh(this.terrain);

        canvas.transform.pop();
    }
}
