import { Canvas, ShaderType } from "./core/canvas.js";
import { CoreEvent, Scene } from "./core/core.js";
import { Model } from "./core/model.js";
import { TransitionEffectType } from "./core/transition.js";
import { State } from "./core/types.js";
import { RGBA, Vector3 } from "./core/vector.js";
import { Menu, MenuButton } from "./menu.js";
import { ObjectManager } from "./objectmanager.js";
import { Settings } from "./settings.js";
import { ShapeGenerator } from "./shapegen.js";
import { Stage } from "./stage.js";


export class GameScene implements Scene {


    private objects : ObjectManager;
    private stage : Stage;

    private pauseMenu : Menu;
    private settings : Settings;


    constructor(param : any, event : CoreEvent) {

        // TODO: Create models in "ModelGen"?
        let cube = (new ShapeGenerator())
            .generateCube(event);
        event.assets.addModel("cube", new Model([cube]));

        this.stage = new Stage(1, event);
        this.objects = new ObjectManager(this.stage, event);

        this.pauseMenu = new Menu(
            [
                new MenuButton("Resume", event => {

                    this.pauseMenu.deactivate();
                }),

                new MenuButton("Restart", event => {

                    this.restart(event);
                }),

                new MenuButton("Settings", event => {

                    this.settings.activate();
                }),

                new MenuButton("Quit", event => {})
            ]);

        this.settings = new Settings(event);
    }   


    private reset() {

        this.objects.reset();
        this.stage.reset();

        this.pauseMenu.deactivate();
    }


    private restart(event : CoreEvent) {

        event.transition.activate(true, TransitionEffectType.Fade, 1.0/15.0,
            () => this.reset(), 
            new RGBA(0.33, 0.66, 1.0));
    }


    public update(event : CoreEvent) {

        if (event.transition.isActive()) return;

        if (this.settings.isActive()) {

            this.settings.update(event);
            return;
        }

        if (this.pauseMenu.isActive()) {

            this.pauseMenu.update(event);
            return;
        }

        if (event.input.getAction("start") == State.Pressed) {

            this.pauseMenu.activate(0);
            return;
        }

        this.stage.update(event);
        this.objects.update(this.stage, event);

        if (event.input.getAction("reset") == State.Pressed) {

            this.restart(event);
        }
    }
    

    public redraw(canvas : Canvas) {

        let lightDir = Vector3.normalize(new Vector3(-0.5, -1.5, 1));
        
        canvas.toggleDepthTest(true);
        canvas.clear(0.33, 0.67, 1.0);
        canvas.resetVertexAndFragmentTransforms();

        // 3D
        canvas.changeShader(ShaderType.NoTexturesLight);
        
        canvas.transform.loadIdentity();
        canvas.transform.setIsometricCamera(canvas.width/canvas.height, 0.25);
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
        canvas.transform.fitHeight(720.0, canvas.width/canvas.height);
        canvas.transform.use();

        this.pauseMenu.draw(canvas, 0.5, true);
        this.settings.draw(canvas);
    }


    public dispose() : any {

        return null;
    }
}
