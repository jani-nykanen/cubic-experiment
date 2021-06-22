import { ShaderType } from "./core/canvas.js";
import { Model } from "./core/model.js";
import { Vector3 } from "./core/vector.js";
import { Player } from "./player.js";
import { ShapeGenerator } from "./shapegen.js";
import { Stage } from "./stage.js";
export class GameScene {
    constructor(param, event) {
        // TODO: Create models in "ModelGen"?
        let cube = (new ShapeGenerator())
            .generateCube(event);
        event.assets.addModel("cube", new Model([cube]));
        this.player = new Player(0, 0, 0);
        this.stage = new Stage(1, event);
    }
    update(event) {
        this.player.update(event);
    }
    redraw(canvas) {
        let lightDir = Vector3.normalize(new Vector3(-0.5, -1.5, 1));
        canvas.toggleDepthTest(true);
        canvas.clear(0.33, 0.67, 1.0);
        canvas.resetVertexAndFragmentTransforms();
        // 3D
        canvas.changeShader(ShaderType.NoTexturesLight);
        canvas.transform.loadIdentity();
        canvas.transform.setIsometricCamera(canvas.width / canvas.height, 0.25);
        canvas.transform.use();
        canvas.setDrawColor(1, 1, 1);
        canvas.setLight(0.75, lightDir);
        this.stage.draw(canvas);
        this.player.draw(canvas);
        // 2D
        canvas.changeShader(ShaderType.Textured);
        canvas.toggleDepthTest(false);
        canvas.transform.loadIdentity();
        canvas.transform.fitHeight(720.0, canvas.width / canvas.height);
        canvas.transform.use();
        this.player.drawDebug(canvas);
    }
    dispose() {
        return null;
    }
}
