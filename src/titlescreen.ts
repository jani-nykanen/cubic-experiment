import { Canvas, ShaderType } from "./core/canvas.js";
import { CoreEvent, Scene } from "./core/core.js";
import { TransitionEffectType } from "./core/transition.js";
import { State } from "./core/types.js";
import { RGBA } from "./core/vector.js";
import { GameScene } from "./game.js";
import { Menu, MenuButton } from "./menu.js";
import { Settings } from "./settings.js";


export class TitleScreen implements Scene {


    private options : Menu;
    private settings : Settings;

    private continueGame : boolean;
    private phase : number;
    private enterTimer : number;


    constructor(param : any, event : CoreEvent) {

        this.options = new Menu(
            [
                new MenuButton("New Game",
                event => {

                    this.continueGame = false;
                    event.transition.activate(true, TransitionEffectType.Fade,
                        1.0/30.0, event => event.changeScene(GameScene),
                        new RGBA(0.33, 0.67, 1.0));
                }),

                new MenuButton("Continue",
                event => {

                    this.continueGame = true;
                    event.transition.activate(true, TransitionEffectType.Fade,
                        1.0/30.0, event => event.changeScene(GameScene),
                        new RGBA(0.33, 0.67, 1.0));
                }),


                new MenuButton("Settings",
                event => {

                    this.settings.activate();
                })
            ]
        );
        this.options.activate(0);

        this.settings = new Settings(event);

        event.transition.activate(false, TransitionEffectType.Fade,
            1.0/30.0, null, new RGBA(0.33, 0.67, 1));
        this.phase = 1;

        if (param != null && <number>param > 0) {

            this.phase = 2;
        }

        this.enterTimer = 0;
    }


    public update(event : CoreEvent) {

        const ENTER_TIMER_SPEED = 0.05;

        if (event.transition.isActive()) return;

        if (this.phase == 1) {

            if (event.input.getAction("start") == State.Pressed ||
                event.input.getAction("fire1") == State.Pressed) {

                ++ this.phase;
                event.audio.playSample(event.getSample("pause"), 0.70);
            }

            this.enterTimer = (this.enterTimer + ENTER_TIMER_SPEED*event.step) % (Math.PI*2);

            return;
        }

        if (this.settings.isActive()) {

            this.settings.update(event);
            return;
        }

        this.options.update(event);
    }


    public redraw(canvas : Canvas) {

        const LOGO_SCALE = 0.75;
        const LOGO_SHADOW_OFFSET = 4;

        canvas.changeShader(ShaderType.Textured);
        canvas.toggleDepthTest(false);

        canvas.clear(0.33, 0.67, 1.0);
        canvas.resetVertexAndFragmentTransforms();

        canvas.transform.loadIdentity();
        canvas.transform.fitGivenDimension(720.0, canvas.width/canvas.height);
        canvas.transform.use();

        let view = canvas.transform.getViewport();

        canvas.setDrawColor(1, 1, 0.67);
        canvas.drawTextWithShadow(canvas.getBitmap("font"), "(c)2021 Jani Nyk@nen",
            view.x/2, view.y-28, -28, 0, true, 0.33, 0.33, 2, 2, 0.33);

        canvas.setDrawColor();

        let bmp = canvas.getBitmap("logo");

        for (let i = 1; i >= 0; -- i) {

            if (i == 1)
                canvas.setDrawColor(0, 0, 0, 0.33);
            else
                canvas.setDrawColor(0.67, 1.0, 0.67);

            canvas.drawBitmap(bmp, 
                view.x/2 - bmp.width/2*LOGO_SCALE + i * LOGO_SHADOW_OFFSET, 
                64 + i * LOGO_SHADOW_OFFSET,
                bmp.width*LOGO_SCALE, bmp.height*LOGO_SCALE);
        }

        if (this.phase == 1) {

            canvas.setDrawColor(1, 1, 1,
                0.75 + 0.25*Math.cos(this.enterTimer));

            canvas.drawTextWithShadow(canvas.getBitmap("font"), "Press enter to start",
                view.x/2, view.y/4*3, -28, 0, true, 0.67, 0.67, 4, 4, 0.33,
                this.enterTimer, 4.0, Math.PI / 6);

            return;
        }

        canvas.transform.push();
        canvas.transform.translate(0, view.y/4, 0);
        canvas.transform.use();

        this.options.draw(canvas, 0.5);

        canvas.transform.pop();

        this.settings.draw(canvas, 0.67);

    }


    public dispose = (event : CoreEvent) : any => <any>this.continueGame;

}
