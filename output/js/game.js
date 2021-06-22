import { ShaderType } from "./core/canvas.js";
import { Model } from "./core/model.js";
import { TransitionEffectType } from "./core/transition.js";
import { State } from "./core/types.js";
import { RGBA, Vector3 } from "./core/vector.js";
import { ObjectManager } from "./objectmanager.js";
import { ShapeGenerator } from "./shapegen.js";
import { Stage } from "./stage.js";
export class GameScene {
    constructor(param, event) {
        // TODO: Create models in "ModelGen"?
        let cube = (new ShapeGenerator())
            .generateCube(event);
        event.assets.addModel("cube", new Model([cube]));
        this.stage = new Stage(1, event);
        this.objects = new ObjectManager(this.stage, event);
    }
    reset() {
        this.objects.reset();
    }
    update(event) {
        if (event.transition.isActive())
            return;
        this.objects.update(this.stage, event);
        if (event.input.getAction("reset") == State.Pressed) {
            event.transition.activate(true, TransitionEffectType.Fade, 1.0 / 15.0, () => this.reset(), new RGBA(0.33, 0.66, 1.0));
        }
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
        this.objects.draw(canvas);
        // 2D
        canvas.changeShader(ShaderType.Textured);
        canvas.toggleDepthTest(false);
        canvas.transform.loadIdentity();
        canvas.transform.fitHeight(720.0, canvas.width / canvas.height);
        canvas.transform.use();
    }
    dispose() {
        return null;
    }
}
