import { Core, CoreEvent } from "./core/core.js";
import { Mesh } from "./core/mesh.js";
import { Vector2, Vector3 } from "./core/vector.js";


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


    public generateMesh (event : CoreEvent) : Mesh {
        
        let m = event.constructMesh(
            new Float32Array(this.vertexBuffer), 
            new Float32Array(this.uvBuffer), 
            new Float32Array(this.normalBuffer), 
            new Uint16Array(this.indexBuffer));

        this.vertexBuffer = new Array<number>();
        this.uvBuffer = new Array<number>();
        this.normalBuffer = new Array<number>();
        this.indexBuffer = new Array<number>();

        return m;
    }


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


    private pushVertices4(A : Vector3, B : Vector3, C : Vector3, D: Vector3) {

        this.vertexBuffer.push(
            A.x, A.y, A.z,
            B.x, B.y, B.z,
            C.x, C.y, C.z,

            C.x, C.y, C.z,
            D.x, D.y, D.z,
            A.x, A.y, A.z
        );
    }


    private pushNormals(N : Vector3) {

        this.normalBuffer.push(
            N.x, N.y, N.z,
            N.x, N.y, N.z,
            N.x, N.y, N.z,
        );  
    }


    private pushDefaultUVs() {

        this.uvBuffer.push(
            0, 0, 
            1, 0, 
            1, 1);
    }


    public generateStar(innerRadius : number, 
        thickness : number, points : number, event : CoreEvent) : Mesh {

        let angleStep = Math.PI*2 / points;
        let angle : number;

        let A : Vector3;
        let B : Vector3;
        let C : Vector3;
        let D : Vector3;
        let N1 : Vector3;
        let N2 : Vector3;

        innerRadius /= 2.0;
        thickness /= 2.0;

        for (let i = 0; i < points; ++ i) {

            angle = angleStep/4 + angleStep * i;

            for (let z = -1; z <= 1; z += 2) {

                A = new Vector3(
                    Math.cos(angle) * 0.5, 
                    Math.sin(angle)  * 0.5, 
                    0);
                B = new Vector3(
                    Math.cos(angle + angleStep/2) * innerRadius, 
                    Math.sin(angle + angleStep/2) * innerRadius, 
                    0);
                C = new Vector3(0, 0, thickness * z);
                D = new Vector3(
                    Math.cos(angle - angleStep/2) * innerRadius, 
                    Math.sin(angle - angleStep/2) * innerRadius, 
                    0);

                N1 = Vector3.scalarMultiply(
                    Vector3.cross(
                        Vector3.direction(C, A), 
                        Vector3.direction(C, B)).normalize(),
                    z);

                N2 = Vector3.scalarMultiply(
                    Vector3.cross(
                        Vector3.direction(C, D),
                        Vector3.direction(C, A)).normalize(),
                    z);

                this.pushVertices4(A, B, C, D);
                for (let i = 0; i < 4; ++ i) {

                    this.pushDefaultUVs();
                }
                this.pushNormals(N1);
                this.pushNormals(N2);
            }

        }

        for (let i = 0; i < this.vertexBuffer.length/3; ++ i) {

            this.indexBuffer.push(this.indexBuffer.length);
        }

        return this.generateMesh(event);
    }


    public generateCylinderFromPath(path : (t : number) => Vector2, steps : number, 
        height : number, event : CoreEvent) : Mesh {

        let step = 1.0 / steps;

        let t : number;

        let A : Vector3;
        let B : Vector3;
        let C : Vector3;
        let N1 : Vector3;

        let p : Vector2;

        // "Cap"
        for (let i = 0; i < steps; ++ i) {

            t = i * step;

            p = path(t);
            A = new Vector3(p.x, height, p.y);
            p = path(t + step);
            B = new Vector3(p.x, height, p.y);
            C = new Vector3();

            N1 = new Vector3(0, 1, 0);
                
            this.vertexBuffer.push(
                A.x, A.y, A.z,
                B.x, B.y, B.z,
                C.x, C.y, C.z,
            );

            this.uvBuffer.push(
                0, 0, 
                1, 0, 
                1, 1,
            );
                
            this.normalBuffer.push(
                N1.x, N1.y, N1.z,
                N1.x, N1.y, N1.z,
                N1.x, N1.y, N1.z,
            );          
        }

        for (let i = 0; i < this.vertexBuffer.length/3; ++ i) {

            this.indexBuffer.push(this.indexBuffer.length);
        }

        let k = this.indexBuffer.length;
        let l = k;

        for (let i = 0; i < steps; ++ i) {

            t = i * step;  

            p = path(t);
            A = new Vector3(p.x, height, p.y);
            B = new Vector3(p.x, 0, p.y);

            N1 = Vector3.normalize(B);

            this.vertexBuffer.push(A.x, A.y, A.z, B.x, B.y, B.z);
            this.normalBuffer.push(N1.x, N1.y, N1.z, N1.x, N1.y, N1.z);
            this.uvBuffer.push(0, 0, 0, 0); // We aren't going to texture it anyway

            if (i < steps-1) {

                this.indexBuffer.push(
                    l, l+1, l+3, 
                    l+3, l+2, l);
            }
            else {

                this.indexBuffer.push(
                    l, l+1, k+1, 
                    k+1, k, l);
            }

            l += 2;
        }

        return this.generateMesh(event);
    }


    public generateCylinderFromRegularPolygon(edges : number, 
        radius : number, height : number, event : CoreEvent,
        baseAngle = 0) : Mesh {

        let A : Vector3;
        let B : Vector3;
        let C : Vector3;
        let D : Vector3;
        let N1 : Vector3;
        let N2 : Vector3;

        let angle = 0;
        let angleStep = Math.PI*2 / edges;

        for (let i = 0; i < edges; ++ i) {

            angle = baseAngle + angleStep * i;

            // "Cap"
            A = new Vector3(
                Math.cos(angle) * radius, 
                height, 
                Math.sin(angle) * radius);
            B = new Vector3();
            C = new Vector3(
                Math.cos(angle + angleStep) * radius, 
                height, 
                Math.sin(angle + angleStep) * radius);

            N1 = new Vector3(0, 1, 0);
                
            this.vertexBuffer.push(
                A.x, A.y, A.z,
                B.x, B.y, B.z,
                C.x, C.y, C.z,
            );

            this.uvBuffer.push(
                0, 0, 
                1, 0, 
                1, 1,
            );
                
            this.normalBuffer.push(
                N1.x, N1.y, N1.z,
                N1.x, N1.y, N1.z,
                N1.x, N1.y, N1.z,
            );    
            
            // Edges
            B = C.clone();
            C = new Vector3(B.x, 0, B.z);
            D = new Vector3(A.x, 0, A.z);

            N1 = Vector3.scalarMultiply(
                Vector3.cross(
                    Vector3.direction(C, A), 
                    Vector3.direction(C, B)).normalize(),
                1);

            N2 = Vector3.scalarMultiply(
                Vector3.cross(
                    Vector3.direction(C, D),
                    Vector3.direction(C, A)).normalize(),
                1);

            this.pushVertices4(A, B, C, D);
            this.pushNormals(N1);
            this.pushNormals(N2);
            for (let i = 0; i < 4; ++ i) {

                this.pushDefaultUVs();
            }
        }

        for (let i = 0; i < this.vertexBuffer.length/3; ++ i) {

            this.indexBuffer.push(this.indexBuffer.length);
        }

        return this.generateMesh(event);
    }


    public generateCircle(outerRadius : number, innerRadius : number, steps : number,
        event : CoreEvent, up = 1) : Mesh {

        let angle : number;
        let angleStep = Math.PI*2 / steps;

        let A : Vector3;
        let B : Vector3;
        let C : Vector3;
        let D : Vector3;

        for (let i = 0; i < steps; ++ i) {

            angle = angleStep * i;

            A = new Vector3(
                Math.cos(angle) * outerRadius,
                0, 
                Math.sin(angle) * outerRadius);
            B = new Vector3(
                Math.cos(angle + angleStep) * outerRadius,
                0, 
                Math.sin(angle + angleStep) * outerRadius);
            C = new Vector3(
                Math.cos(angle + angleStep) * innerRadius,
                0, 
                Math.sin(angle + angleStep) * innerRadius);
            D = new Vector3(
                Math.cos(angle) * innerRadius,
                0, 
                Math.sin(angle) * innerRadius);

            this.addTriangle(A, B, C, up);
            this.addTriangle(C, D, A, up);
        }

        return this.generateMesh(event);
    }


    public addHorizontalPlane(x : number, y : number, z : number, 
        width : number, depth : number, up = -1) : ShapeGenerator {

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

        let l = (this.vertexBuffer.length / 3) -4;
        this.indexBuffer.push(
            l, l+1, l+2,
            l+2, l+3, l
        );

        return this;
    }


    public addVerticalPlaneXY(x : number, y : number, z : number, 
        width : number, height : number, front = -1) : ShapeGenerator {

        this.vertexBuffer.push(
            x, y, z,
            x+width, y, z,
            x + width, y+height, z,
            x, y+height, z
        );

        this.uvBuffer.push(
            0, 0, 1,0, 1,1, 0, 1
        );

        this.normalBuffer.push(
            0, 0, front, 
            0, 0, front,
            0, 0, front,
            0, 0, front
        );

        let l = (this.vertexBuffer.length / 3) -4;
        this.indexBuffer.push(
            l, l+1, l+2,
            l+2, l+3, l
        );

        return this;
    }


    public addVerticalPlaneYZ(x : number, y : number, z : number, 
        depth : number, height : number, front = 1) : ShapeGenerator {

        this.vertexBuffer.push(
            x, y, z,
            x, y, z+depth,
            x, y+height, z+depth,
            x, y+height, z
        );

        this.uvBuffer.push(
            0, 0, 1,0, 1,1, 0, 1
        );

        this.normalBuffer.push(
            front, 0, 0, 
            front, 0, 0,
            front, 0, 0,
            front, 0, 0
        );

        let l = (this.vertexBuffer.length / 3) -4;
        this.indexBuffer.push(
            l, l+1, l+2,
            l+2, l+3, l
        );

        return this;
    }


    public addTriangle(A : Vector3, B : Vector3, C : Vector3, normalDir = -1) : ShapeGenerator {

        let N = Vector3.scalarMultiply(
            Vector3.cross(
                Vector3.direction(C, A), 
                Vector3.direction(C, B)).normalize(),
            normalDir);

        this.vertexBuffer.push(
            A.x, A.y, A.z,
            B.x, B.y, B.z,
            C.x, C.y, C.z,
        );

        this.uvBuffer.push(
            0, 0, 
            1, 0, 
            1, 1,
        );
            
        this.normalBuffer.push(
            N.x, N.y, N.z,
            N.x, N.y, N.z,
            N.x, N.y, N.z,
        );           
        
        for (let i = 0; i < 3; ++ i) {

            this.indexBuffer.push(this.indexBuffer.length);
        }

        return this;
    } 
}
