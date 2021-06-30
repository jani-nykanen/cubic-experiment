import { ShaderType } from "./core/canvas.js";
import { Model } from "./core/model.js";
import { TransitionEffectType } from "./core/transition.js";
import { State } from "./core/types.js";
import { RGBA, Vector3 } from "./core/vector.js";
import { Menu, MenuButton } from "./menu.js";
import { ObjectManager } from "./objectmanager.js";
import { Settings } from "./settings.js";
import { ShapeGenerator } from "./shapegen.js";
import { Stage } from "./stage.js";
export class GameScene {
    constructor(param, event) {
        // TODO: Create models in "ModelGen"?
        let cube = (new ShapeGenerator())
            .generateCube(event);
        event.assets.addModel("cube", new Model([cube]));
        this.stageIndex = 1;
        this.stage = new Stage(this.stageIndex, event);
        this.objects = new ObjectManager(this.stage, event);
        this.pauseMenu = new Menu([
            new MenuButton("Resume", event => {
                this.pauseMenu.deactivate();
            }),
            new MenuButton("Restart", event => {
                this.restart(event);
            }),
            new MenuButton("Settings", event => {
                this.settings.activate();
            }),
            new MenuButton("Quit", event => { })
        ]);
        this.settings = new Settings(event);
    }
    reset() {
        this.objects.reset();
        this.stage.reset();
        this.pauseMenu.deactivate();
    }
    restart(event) {
        event.transition.activate(true, TransitionEffectType.Fade, 1.0 / 15.0, () => this.reset(), new RGBA(0.33, 0.66, 1.0));
    }
    update(event) {
        if (event.transition.isActive())
            return;
        if (this.settings.isActive()) {
            this.settings.update(event);
            return;
        }
        if (this.pauseMenu.isActive()) {
            this.pauseMenu.update(event);
            return;
        }
        if (event.input.getAction("start") == State.Pressed) {
            event.audio.playSample(event.getSample("pause"), 0.70);
            this.pauseMenu.activate(0);
            return;
        }
        this.stage.update(event);
        this.objects.update(this.stage, event);
        if (event.input.getAction("reset") == State.Pressed) {
            event.audio.playSample(event.getSample("choose"), 0.70);
            this.restart(event);
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
        canvas.setLight(0.80, lightDir);
        this.stage.draw(canvas);
        this.objects.draw(canvas);
        this.stage.postDraw(canvas);
        // 2D
        canvas.changeShader(ShaderType.Textured);
        canvas.toggleDepthTest(false);
        canvas.transform.loadIdentity();
        canvas.transform.fitHeight(720.0, canvas.width / canvas.height);
        canvas.transform.use();
        canvas.drawTextWithShadow(canvas.getBitmap("font"), "STAGE " + String(this.stageIndex), canvas.transform.getViewport().x / 2, 12, -28, 0, true, 0.5, 0.5, 4, 4, 0.33);
        this.pauseMenu.draw(canvas, 0.5, true);
        this.settings.draw(canvas);
    }
    dispose() {
        return null;
    }
}
