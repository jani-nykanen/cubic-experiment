import { ShaderType } from "./core/canvas.js";
import { Vector3 } from "./core/vector.js";
import { ShapeGenerator } from "./shapegen.js";
export class GameScene {
    constructor(param, event) {
        this.angle = 0.0;
        this.cube = (new ShapeGenerator())
            .generateCube(event);
    }
    update(event) {
        this.angle = (this.angle + 0.025 * event.step) % (Math.PI * 2);
    }
    redraw(canvas) {
        let lightDir = Vector3.normalize(new Vector3(1, -1, -1));
        canvas.toggleDepthTest(true);
        canvas.clear(0.67, 0.67, 0.67);
        canvas.resetVertexAndFragmentTransforms();
        // 3D
        canvas.changeShader(ShaderType.TexturedLight);
        canvas.transform.loadIdentity();
        canvas.transform.setIsometricCamera(canvas.width / canvas.height, 0.5);
        canvas.transform.rotate(this.angle, new Vector3(0, 1, 0));
        canvas.transform.use();
        canvas.setDrawColor(1, 1, 1);
        canvas.setLight(1.0, lightDir);
        canvas.bindTexture(canvas.getBitmap("crate"));
        canvas.drawMesh(this.cube);
        // 2D
        canvas.changeShader(ShaderType.Textured);
        canvas.toggleDepthTest(false);
        canvas.transform.loadIdentity();
        canvas.transform.fitHeight(720.0, canvas.width / canvas.height);
        canvas.transform.use();
        canvas.drawText(canvas.getBitmap("font"), "TEST", 8, 8, -24, 0, false, 0.5, 0.5);
    }
    dispose() {
        return null;
    }
}
