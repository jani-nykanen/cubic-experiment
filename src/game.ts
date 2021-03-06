import { ConfirmationBox } from "./confirmationbox.js";
import { Canvas, ShaderType } from "./core/canvas.js";
import { CoreEvent, Scene } from "./core/core.js";
import { clamp } from "./core/mathext.js";
import { TransitionEffectType } from "./core/transition.js";
import { State } from "./core/types.js";
import { RGBA, Vector3 } from "./core/vector.js";
import { Ending } from "./ending.js";
import { Menu, MenuButton } from "./menu.js";
import { ObjectManager } from "./objectmanager.js";
import { Settings } from "./settings.js";
import { Stage } from "./stage.js";
import { TitleScreen } from "./titlescreen.js";


const HINTS = [

    "Use arrow keys to move.",
    "Press R to reset the stage."
];


export class GameScene implements Scene {


    static STAGE_CLEAR_ANIMATION_TIME = 90;
    static STAGE_EXTRA_WAIT_TIME = 15;


    private objects : ObjectManager;
    private stage : Stage;

    private stageIndex : number;

    private pauseMenu : Menu;
    private yesNoMenu : ConfirmationBox;
    private settings : Settings;

    private stageClear : boolean;
    private stageClearTimer : number;
    private fadeScale : number;

    private restarting : boolean;


    constructor(param : any, event : CoreEvent) {


        let index = 1;
        let str : string;
        if (<boolean>param == true) {

            try {

                str = window.localStorage.getItem("boxpuzzle__levelindex");
                if (str == null)
                    index = 1;
                else
                    index = clamp(
                        Number(window.localStorage.getItem("boxpuzzle__levelindex")), 
                        1, this.findLastStage(event));

            }
            catch(e) {

                console.log(e);
                index = 1;
            }
        }
        this.stageIndex = index;

        this.stage = new Stage(this.stageIndex, event);
        this.objects = new ObjectManager(this.stage, event);

        this.yesNoMenu = new ConfirmationBox(
            event => {

                this.restarting = true;
                    event.transition.activate(true, TransitionEffectType.Fade, 1.0/30.0,
                        event => {
                            
                            event.changeScene(TitleScreen);
                        },
                        new RGBA(0.33, 0.66, 1.0));
                event.audio.resumeMusic();
            },
            event => {

                this.yesNoMenu.deactivate();
                // event.audio.resumeMusic();

            }, event
        );

        this.pauseMenu = new Menu(
            [
                new MenuButton("Resume", event => {

                    this.pauseMenu.deactivate();

                    event.audio.resumeMusic();
                }),

                new MenuButton("Restart", event => {

                    this.restart(event);

                    event.audio.resumeMusic();
                }),

                new MenuButton("Settings", event => {

                    this.settings.activate();
                }),

                new MenuButton("Quit", event => {

                    this.yesNoMenu.activate();
                })
            ]);

        this.settings = new Settings(event);

        this.stageClear = false;
        this.stageClearTimer = 0;
        this.fadeScale = 2.0;
        this.restarting = false;

        event.transition.activate(false, TransitionEffectType.Fade,
            1.0/30.0, null, new RGBA(0.33, 0.67, 1.0));
    }   


    private findLastStage(event : CoreEvent) : number {

        let num = 1;

        while (event.assets.getTilemap(String(num)) != null) {

            ++ num;
        }
        return num-1;
    }


    private reset() {

        this.objects.reset();
        this.stage.reset();

        this.pauseMenu.deactivate();

        this.stageClear = false;
        this.stageClearTimer = 0;
        this.fadeScale = 1.0;

        this.restarting = true;
    }


    private nextStage(event : CoreEvent) {

        if (this.stage.isFinalStage()) {

            event.changeScene(Ending);
            return;
        }

        ++ this.stageIndex;

        this.stage.nextStage(event);
        this.stage.parseObjectLayer(this.objects, event);

        this.pauseMenu.deactivate();

        this.stageClear = false;
        this.stageClearTimer = 0;
        this.fadeScale = 2.0;

        try {

            window.localStorage.setItem("boxpuzzle__levelindex", String(this.stageIndex));
        }
        catch(e) {

            console.log(e);
        }
    }


    private restart(event : CoreEvent) {

        this.restarting = true;

        event.transition.activate(true, TransitionEffectType.Fade, 1.0/15.0,
            () => this.reset(), 
            new RGBA(0.33, 0.66, 1.0));
    }


    public update(event : CoreEvent) {

        const FADE_OUT_SCALE_SPEED = 1.0 / 30.0;
        const FADE_IN_SCALE_SPEED = 0.5 / 30.0;

        let speed : number;

        if (event.transition.isActive()) {

            if (!this.restarting) {

                speed = 1.0;
                if (this.stageClear &&
                    this.stage.isFinalStage())
                    speed = 1.0/4.0;

                if (this.stageClear) {

                    this.fadeScale -= FADE_IN_SCALE_SPEED * speed * event.step;
                }
                else {

                    this.fadeScale -= FADE_OUT_SCALE_SPEED * speed * event.step;
                }
            }

            return;
        }


        if (this.stageClear) {

            this.stage.update(event);

            if ((this.stageClearTimer += event.step) >= 
                GameScene.STAGE_CLEAR_ANIMATION_TIME + 
                GameScene.STAGE_EXTRA_WAIT_TIME) {

                speed = this.stage.isFinalStage() ? 1.0/120.0 : 1.0/30.0;

                event.transition.activate(true, TransitionEffectType.Fade,
                    speed, event => {

                        if (!this.stage.isFinalStage()) {

                            event.audio.resumeMusic();
                        }

                        this.nextStage(event);
                    }, new RGBA(0.33, 0.67, 1.0));
            }

            return;
        }

        if (this.stage.getStarCount() <= 0) {

            if (!this.stageClear) {

                event.audio.pauseMusic();
            }

            this.fadeScale = 1.0;
            this.stageClearTimer = 0;
            this.stageClear = true;

            if (!this.stage.isFinalStage()) {

                event.audio.playSample(event.getSample("victory"), 0.80);
            }
            else {

                this.stageClearTimer = 
                    (GameScene.STAGE_CLEAR_ANIMATION_TIME + GameScene.STAGE_EXTRA_WAIT_TIME)
                    - Stage.STAR_TIME;
            }

            return;
        }

        this.fadeScale = 1.0;
        this.restarting = false;

        if (this.yesNoMenu.isActive()) {

            this.yesNoMenu.update(event);
            return;
        }

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
            event.audio.pauseMusic();

            return;
        }

        this.stage.update(event);
        this.objects.update(this.stage, event);

        if (event.input.getAction("reset") == State.Pressed) {

            event.audio.playSample(event.getSample("choose"), 0.70);
            this.restart(event);
        }
    }


    private drawStageClear(canvas : Canvas) {

        const TEXT = "STAGE CLEAR";
        const CHAR_OFFSET = -28;
        const APPEAR_SCALE = 3.0;

        let view = canvas.transform.getViewport();

        canvas.changeShader(ShaderType.NoTextures);
        canvas.setDrawColor(0, 0, 0, 0.33);
        canvas.drawRectangle(0, 0, view.x, view.y);

        canvas.changeShader(ShaderType.Textured);

        let charIndex = ((this.stageClearTimer / GameScene.STAGE_CLEAR_ANIMATION_TIME) * TEXT.length) | 0;
        let d = GameScene.STAGE_CLEAR_ANIMATION_TIME / TEXT.length;
        let alpha = (this.stageClearTimer % d) / d;

        let x = view.x/2 - (TEXT.length * (64 + CHAR_OFFSET))/2;
        let scale = 1.0;

        if (charIndex >= 5)
            ++ charIndex;

        canvas.setDrawColor(1, 1, 0.67);
        canvas.drawTextWithShadow(canvas.getBitmap("font"), TEXT.substr(0, charIndex),
            x, view.y/2-32, CHAR_OFFSET, 0, false, 1, 1, 4, 4, 0.33);

        if (charIndex < TEXT.length) {

            scale = 1.0 + (APPEAR_SCALE-1.0) * (1.0 - alpha);

            canvas.setDrawColor(1, 1, 0.67, alpha);
            canvas.drawTextWithShadow(canvas.getBitmap("font"), TEXT.substr(charIndex, 1),
                x + (64 + CHAR_OFFSET) * (charIndex) - (64 + CHAR_OFFSET)/2 * (scale-1), 
                view.y/2-32*scale, CHAR_OFFSET, 0, false, scale, scale, 4, 4, 0.33);
        }
    }


    private drawHint(canvas : Canvas) {

        const CHAR_OFFSET = -28;
        const SCALE = 0.33;

        let view = canvas.transform.getViewport();

        let len = HINTS[this.stageIndex-1].length;
        let w = (len * (64 + CHAR_OFFSET)) * SCALE + 16;
        let h = 64;

        canvas.changeShader(ShaderType.NoTextures);
        canvas.setDrawColor(0, 0, 0, 0.33);
        canvas.drawRectangle(0, view.y-h, w, h);

        canvas.changeShader(ShaderType.Textured);
        canvas.setDrawColor();
        canvas.drawTextWithShadow(canvas.getBitmap("font"), "HINT:",
            8, view.y - 56, CHAR_OFFSET, 0, false, SCALE, SCALE, 2, 2, 0.33);
        canvas.drawTextWithShadow(canvas.getBitmap("font"), HINTS[this.stageIndex-1],
            8, view.y - 32, CHAR_OFFSET, 0, false, SCALE, SCALE, 2, 2, 0.33);
    }
    

    public redraw(canvas : Canvas) {

        const SCALE_CORRECTION_TERM = 0.75;

        let lightDir = Vector3.normalize(new Vector3(-0.5, -1.5, 1));
        
        canvas.toggleDepthTest(true);
        canvas.clear(0.33, 0.67, 1.0);
        canvas.resetVertexAndFragmentTransforms();

        // 3D
        canvas.changeShader(ShaderType.NoTexturesLight);
        
        canvas.transform.loadIdentity();
        canvas.transform.setIsometricCamera(canvas.width/canvas.height, 
            SCALE_CORRECTION_TERM * this.stage.getCameraScale() * this.fadeScale);
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
        canvas.transform.fitGivenDimension(720.0, canvas.width/canvas.height);
        canvas.transform.use();

        if (!this.stage.isFinalStage()) {

            canvas.drawTextWithShadow(canvas.getBitmap("font"), "STAGE " + String(this.stageIndex),
                canvas.transform.getViewport().x/2, 12, -28, 0, true, 0.5, 0.5,
                4, 4, 0.33);
        }

        if (this.stageIndex <= HINTS.length) {

            this.drawHint(canvas);
        }

        this.pauseMenu.draw(canvas, 0.5, true);
        this.settings.draw(canvas);
        this.yesNoMenu.draw(canvas, 0.33);

        if (!this.stage.isFinalStage() &&
            this.stageClear) {

            this.drawStageClear(canvas);
        }
    }


    public dispose(event : CoreEvent) : any {

        this.stage.dispose(event);
        this.objects.dispose(event);

        return <any>1; // Heh, any-one
    }
}
