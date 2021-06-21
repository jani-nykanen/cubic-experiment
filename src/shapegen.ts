import { CoreEvent } from "./core/core.js";
import { Mesh } from "./core/mesh.js";


export class ShapeGenerator {


    private vertexBuffer : Array<number>;
    private uvBuffer : Array<number>;
    private normalBuffer : Array<number>;
    private indexBuffer : Array<number>;
    

    constructor() {

        this.vertexBuffer = new Array<number>();
        this.uvBuffer = new Array<number>();
        this.normalBuffer = new Array<number>();
        this.indexBuffer = new Array<number>();
    }


    public generateMesh = (event : CoreEvent) : Mesh => 
        event.constructMesh(
            new Float32Array(this.vertexBuffer), 
            new Float32Array(this.uvBuffer), 
            new Float32Array(this.normalBuffer), 
            new Uint16Array(this.indexBuffer));


    public generateCube(event : CoreEvent) : Mesh {

        this.vertexBuffer = [

            // Front
            -0.5, -0.5, -0.5,
            0.5, -0.5, -0.5,
            0.5, 0.5, -0.5,
            -0.5, 0.5, -0.5,

            // Back
            -0.5, -0.5, 0.5,
            0.5, -0.5, 0.5,
            0.5, 0.5, 0.5,
            -0.5, 0.5, 0.5,
            
            // Top
            -0.5, -0.5, -0.5,
            0.5, -0.5, -0.5,
            0.5, -0.5, 0.5,
            -0.5,- 0.5, 0.5,

            // Bottom
            -0.5, 0.5, -0.5,
            0.5, 0.5, -0.5,
            0.5, 0.5, 0.5,
            -0.5, 0.5, 0.5,

            // Left
            -0.5, -0.5, -0.5,
            -0.5, 0.5, -0.5,
            -0.5, 0.5, 0.5,
            -0.5, -0.5, 0.5,

            // Right
            0.5, -0.5, -0.5,
            0.5, 0.5, -0.5,
            0.5, 0.5, 0.5,
            0.5, -0.5, 0.5,
        ];

        this.uvBuffer = [

            0, 0, 1, 0, 1, 1, 0, 1,
            0, 0, 1, 0, 1, 1, 0, 1,
            0, 0, 1, 0, 1, 1, 0, 1,
            0, 0, 1, 0, 1, 1, 0, 1,
            0, 0, 1, 0, 1, 1, 0, 1,
            0, 0, 1, 0, 1, 1, 0, 1,
        ];

        this.normalBuffer = [

            0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,

            0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
            0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,

            -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        ];

        this.indexBuffer = [
            0, 1, 2, 2, 3, 0,

            4, 5, 6, 6, 7, 4,

            8, 9, 10, 10, 11, 8,
            12, 13, 14, 14, 15, 12,

            16, 17, 18, 18, 19, 16,
            20, 21, 22, 22, 23, 20,
        ];

        return this.generateMesh(event);
    }


    public addHorizontalPlane(x : number, y : number, z : number, 
        width : number, depth : number, up = -1) {

        this.vertexBuffer.push(
            x, y, z,
            x+width, y, z,
            x + width, y, z+depth,
            x, y, z+depth
        );

        this.uvBuffer.push(
            0, 0, 1,0, 1,1, 0, 1
        );

        this.normalBuffer.push(
            0, up, 0, 
            0, up, 0,
            0, up, 0,
            0, up, 0
        );

        let l = this.vertexBuffer.length / 3;
        this.indexBuffer.push(
            l, l+1, l+2,
            l+2, l+3, l
        );
    }
}
