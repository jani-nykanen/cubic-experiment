import { Matrix4 } from "./matrix.js";
import { Vector2, Vector3 } from "./vector.js";
export class Transformations {
    constructor(activeShader) {
        this.getViewport = () => this.viewport.clone();
        this.model = Matrix4.identity();
        this.modelStack = new Array();
        this.rotation = Matrix4.identity();
        this.rotationStack = new Array();
        this.view = Matrix4.identity();
        this.projection = Matrix4.identity();
        this.product = Matrix4.identity();
        this.productComputed = true;
        this.viewport = new Vector2(1, 1);
        this.activeShader = activeShader;
    }
    computeProduct() {
        if (this.productComputed)
            return;
        this.product =
            Matrix4.multiply(this.projection, Matrix4.multiply(this.view, this.model));
        this.productComputed = true;
    }
    setActiveShader(shader) {
        this.activeShader = shader;
    }
    loadIdentity() {
        this.model = Matrix4.identity();
        this.rotation = Matrix4.identity();
        this.productComputed = false;
    }
    translate(x = 0, y = 0, z = 0) {
        this.model = Matrix4.multiply(this.model, Matrix4.translate(x, y, z));
        this.productComputed = false;
    }
    scale(sx = 1, sy = 1, sz = 1) {
        this.model = Matrix4.multiply(this.model, Matrix4.scale(sx, sy, sz));
        this.productComputed = false;
    }
    rotate(angle = 0, axes) {
        let op = Matrix4.rotate(angle, axes.x, axes.y, axes.z);
        this.model = Matrix4.multiply(this.model, op);
        this.rotation = Matrix4.multiply(this.rotation, op);
        this.productComputed = false;
    }
    setView2D(width, height) {
        this.view = Matrix4.ortho2D(0, width, height, 0);
        this.projection = Matrix4.identity();
        this.productComputed = false;
        this.viewport = new Vector2(width, height);
    }
    fitHeight(height, aspectRatio) {
        let width = height * aspectRatio;
        this.setView2D(width, height);
    }
    setCamera(center, target, up = new Vector3(0, 1, 0)) {
        this.view = Matrix4.lookAt(center, target, up);
        this.productComputed = false;
    }
    setPerspective(fovY, aspectRatio, near, far) {
        this.projection = Matrix4.perspective(fovY, aspectRatio, near, far);
        this.productComputed = false;
    }
    setOrthoProjection(aspectRatio, near, far) {
        this.projection = Matrix4.ortho(-aspectRatio, aspectRatio, 1.0, -1.0, near, far);
        this.productComputed = false;
    }
    setIsometricCamera(aspectRatio, scale) {
        let camPos = Vector3.normalize(new Vector3(1, 1, -1));
        this.setOrthoProjection(aspectRatio, -100.0, 100.0);
        this.setCamera(camPos, new Vector3());
        this.view = Matrix4.multiply(this.view, Matrix4.scale(scale, scale, scale));
        this.productComputed = false;
    }
    push() {
        this.modelStack.push(this.model.clone());
        this.rotationStack.push(this.rotation.clone());
    }
    pop() {
        this.model = this.modelStack.pop();
        this.rotation = this.rotationStack.pop();
        this.productComputed = false;
    }
    use() {
        this.computeProduct();
        this.activeShader.setTransformMatrix(this.product);
        this.activeShader.setRotationMatrix(this.rotation);
    }
}
