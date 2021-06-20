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
        canvas.toggleDepthTest(true);
        canvas.clear(0.67, 0.67, 0.67);
        canvas.resetVertexAndFragmentTransforms();
        // 3D
        canvas.changeShader(ShaderType.NoTexturesLight);
        canvas.transform.loadIdentity();
        canvas.transform.setCamera(new Vector3(0, -1, -4), new Vector3());
        canvas.transform.setPerspective(60.0, canvas.width / canvas.height, 0.1, 100.0);
        // canvas.transform.setIsometricProjection();
        // canvas.transform.scale(0.25, 0.25, 0.25);
        canvas.transform.rotate(this.angle, new Vector3(1, -1, 0));
        canvas.transform.use();
        canvas.setDrawColor(1, 0, 0);
        canvas.setLight(1.0, (new Vector3(0, -1, -4)).normalize());
        // canvas.bindTexture(canvas.getBitmap("crate"));
        canvas.drawMesh(this.cube);
        // 2D
        canvas.changeShader(ShaderType.Textured);
        canvas.toggleDepthTest(false);
        canvas.transform.loadIdentity();
        canvas.transform.fitHeight(240.0, canvas.width / canvas.height);
        canvas.transform.use();
        canvas.drawText(canvas.getBitmap("font"), "TEST", 2, 2, 0, 0);
    }
    dispose() {
        return null;
    }
}
