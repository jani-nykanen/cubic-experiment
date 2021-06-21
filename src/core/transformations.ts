import { Matrix4 } from "./matrix.js";
import { Shader } from "./shader.js";
import { Vector2, Vector3 } from "./vector.js";



export class Transformations {
    

    private model : Matrix4;
    private modelStack : Array<Matrix4>;
    private rotation : Matrix4;
    private rotationStack : Array<Matrix4>;
    private view : Matrix4;
    private projection : Matrix4;
    private product : Matrix4;
    private productComputed : boolean;

    private viewport : Vector2;

    private activeShader : Shader;


    constructor(activeShader : Shader) {

        this.model = Matrix4.identity();
        this.modelStack = new Array<Matrix4> ();

        this.rotation = Matrix4.identity();
        this.rotationStack = new Array<Matrix4> ();

        this.view = Matrix4.identity();
        this.projection = Matrix4.identity();
        this.product = Matrix4.identity();
    
        this.productComputed = true;

        this.viewport = new Vector2(1, 1);

        this.activeShader = activeShader;
    }


    private computeProduct() {

        if (this.productComputed) return;

        this.product = 
            Matrix4.multiply(this.projection,
            Matrix4.multiply(this.view, this.model));
        this.productComputed = true;
    }


    public setActiveShader(shader : Shader) {

        this.activeShader = shader;
    }


    public loadIdentity() {

        this.model = Matrix4.identity();
        this.rotation = Matrix4.identity();
        this.productComputed = false;
    }


    public translate(x = 0, y = 0, z = 0) {

        this.model = Matrix4.multiply(
            this.model,
            Matrix4.translate(x, y, z));
        this.productComputed = false;
    }


    public scale(sx = 1, sy = 1, sz = 1) {

        this.model = Matrix4.multiply(
            this.model,
            Matrix4.scale(sx, sy, sz));
        this.productComputed = false;
    }


    public rotate(angle = 0, axes : Vector3) {

        let op = Matrix4.rotate(angle, axes.x, axes.y, axes.z);

        this.model = Matrix4.multiply(this.model, op);
        this.rotation = Matrix4.multiply(this.rotation, op);

        this.productComputed = false;
    }


    public setView2D(width : number, height : number) {

        this.view = Matrix4.ortho2D(0, width, height, 0);
        this.projection = Matrix4.identity();
        this.productComputed = false;

        this.viewport = new Vector2(width, height);
    }


    public fitHeight(height : number, aspectRatio : number) {

        let width = height * aspectRatio;

        this.setView2D(width, height);
    }


    public setCamera(center : Vector3, target : Vector3, up = new Vector3(0, 1, 0)) {

        this.view = Matrix4.lookAt(center, target, up);
        this.productComputed = false;
    }


    public setPerspective(fovY : number, aspectRatio : number, near : number, far : number) {

        this.projection = Matrix4.perspective(fovY, aspectRatio, near, far);
        this.productComputed = false;
    }


    public setOrthoProjection(aspectRatio : number, near : number, far : number) {

        this.projection = Matrix4.ortho(-aspectRatio, aspectRatio, 1.0, -1.0, near, far);
        this.productComputed = false;
    }


    public setIsometricCamera(aspectRatio : number, scale : number) {

        let camPos = Vector3.normalize(new Vector3(-1, 1, 1));

        this.setOrthoProjection(aspectRatio, 0.1, 100.0);
        this.setCamera(camPos, new Vector3());
        this.view = Matrix4.multiply(this.view, Matrix4.scale(scale, scale, scale));

        this.productComputed = false;
    }


    public push() {

        this.modelStack.push(this.model.clone());
        this.rotationStack.push(this.rotation.clone());
    }


    public pop() {

        this.model = this.modelStack.pop();
        this.rotation = this.rotationStack.pop();

        this.productComputed = false;
    }


    public use() {

        this.computeProduct();
        this.activeShader.setTransformMatrix(this.product);
        this.activeShader.setRotationMatrix(this.rotation);
    }


    public getViewport = () : Vector2 => this.viewport.clone();
}
