import { ShaderType } from "./core/canvas.js";
import { TransitionEffectType } from "./core/transition.js";
import { State } from "./core/types.js";
import { RGBA } from "./core/vector.js";
import { GameScene } from "./game.js";
import { StoryIntro } from "./storyintro.js";
import { Menu, MenuButton } from "./menu.js";
import { Settings } from "./settings.js";
const LOGO_TARGET_POS = 64;
export class TitleScreen {
    constructor(param, event) {
        this.dispose = (event) => 1;
        this.options = new Menu([
            new MenuButton("New Game", event => {
                event.transition.activate(true, TransitionEffectType.Fade, 1.0 / 30.0, event => event.changeScene(StoryIntro), new RGBA(0.33, 0.67, 1.0));
            }),
            new MenuButton("Continue", event => {
                event.transition.activate(true, TransitionEffectType.Fade, 1.0 / 30.0, event => event.changeScene(GameScene), new RGBA(0.33, 0.67, 1.0));
            }),
            new MenuButton("Settings", event => {
                this.settings.activate();
            })
        ]);
        this.options.activate(0);
        this.settings = new Settings(event);
        this.phase = 0;
        this.logoPos = -384;
        if (param != null && param > 0) {
            this.phase = 2;
            this.logoPos = LOGO_TARGET_POS;
        }
        this.enterTimer = Math.PI;
        this.logoSpeed = 0;
        this.logoTimer = 0;
    }
    updateLogo(event) {
        const SPEED_LIMIT = 64.0;
        const SPEED_DELTA = 0.5;
        const TIMER_SPEED = 0.1;
        if (this.logoPos < LOGO_TARGET_POS) {
            this.logoSpeed += SPEED_DELTA * event.step;
            this.logoSpeed = Math.min(this.logoSpeed, SPEED_LIMIT);
            if ((this.logoPos += this.logoSpeed * event.step) >= LOGO_TARGET_POS) {
                this.logoPos = LOGO_TARGET_POS;
                event.audio.playSample(event.getSample("soft"), 0.75);
            }
        }
        else {
            if ((this.logoTimer += TIMER_SPEED * event.step) >= Math.PI * 2) {
                this.logoTimer = 0;
                this.phase = 1;
            }
        }
    }
    update(event) {
        const ENTER_TIMER_SPEED = 0.05;
        if (event.transition.isActive())
            return;
        if (this.phase == 0) {
            this.updateLogo(event);
            return;
        }
        if (this.phase == 1) {
            if (event.input.getAction("start") == State.Pressed ||
                event.input.getAction("fire1") == State.Pressed) {
                ++this.phase;
                event.audio.playSample(event.getSample("pause"), 0.70);
            }
            this.enterTimer = (this.enterTimer + ENTER_TIMER_SPEED * event.step) % (Math.PI * 2);
            return;
        }
        if (this.settings.isActive()) {
            this.settings.update(event);
            return;
        }
        this.options.update(event);
    }
    redraw(canvas) {
        const LOGO_SCALE = 0.75;
        const LOGO_SHADOW_OFFSET = 4;
        canvas.changeShader(ShaderType.Textured);
        canvas.toggleDepthTest(false);
        canvas.clear(0.33, 0.67, 1.0);
        canvas.resetVertexAndFragmentTransforms();
        canvas.transform.loadIdentity();
        canvas.transform.fitGivenDimension(720.0, canvas.width / canvas.height);
        canvas.transform.use();
        let view = canvas.transform.getViewport();
        canvas.setDrawColor(1, 1, 0.67);
        canvas.drawTextWithShadow(canvas.getBitmap("font"), "(c)2021 Jani Nyk@nen", view.x / 2, view.y - 28, -28, 0, true, 0.33, 0.33, 2, 2, 0.33);
        canvas.setDrawColor();
        let bmp = canvas.getBitmap("logo");
        let scalex = 1;
        let scaley = 1;
        for (let i = 1; i >= 0; --i) {
            if (i == 1)
                canvas.setDrawColor(0, 0, 0, 0.33);
            else
                canvas.setDrawColor(0.67, 1.0, 0.67);
            if (this.phase == 0) {
                if (this.logoTimer < Math.PI) {
                    scalex = 1.0 + 0.33 * Math.sin(this.logoTimer);
                    scaley = 1.0 - 0.33 * Math.sin(this.logoTimer);
                }
                else {
                    scaley = 1.0 + 0.33 * Math.sin(this.logoTimer - Math.PI);
                    scalex = 1.0 - 0.33 * Math.sin(this.logoTimer - Math.PI);
                }
            }
            canvas.drawBitmap(bmp, view.x / 2 - bmp.width / 2 * LOGO_SCALE * scalex + i * LOGO_SHADOW_OFFSET, this.logoPos - 512 * LOGO_SCALE * scaley + 512 * LOGO_SCALE + i * LOGO_SHADOW_OFFSET, bmp.width * LOGO_SCALE * scalex, bmp.height * LOGO_SCALE * scaley);
        }
        if (this.phase == 0)
            return;
        if (this.phase == 1) {
            canvas.setDrawColor(1, 1, 1, 0.5 + 0.5 * Math.cos(this.enterTimer));
            canvas.drawTextWithShadow(canvas.getBitmap("font"), "Press enter to start", view.x / 2, view.y / 4 * 3, -28, 0, true, 0.67, 0.67, 4, 4, 0.33, this.enterTimer, 4.0, Math.PI / 6);
            return;
        }
        canvas.transform.push();
        canvas.transform.translate(0, view.y / 4, 0);
        canvas.transform.use();
        this.options.draw(canvas, 0.5);
        canvas.transform.pop();
        this.settings.draw(canvas, 0.67);
    }
}
