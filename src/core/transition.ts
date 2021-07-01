import { Canvas, ShaderType } from "./canvas.js";
import { CoreEvent } from "./core.js";
import { RGBA, Vector2 } from "./vector.js";


export enum TransitionEffectType {

    None = 0,
    Fade = 1,
}


export class TransitionEffectManager {


    private timer : number;
    private fadeIn : boolean;
    private effectType : TransitionEffectType;
    private color : RGBA;
    private active : boolean;
    private speed : number;
    private wait : boolean;
    
    private callback : ((event : CoreEvent) => void);


    constructor() {

        this.timer = 0;
        this.fadeIn = false;
        this.effectType = TransitionEffectType.None;
        this.color = new RGBA();
        this.active = false;
        this.speed = 1;
        this.wait = false;

        this.callback = ev => {};
    }


    public activate(fadeIn : boolean, type : TransitionEffectType, speed : number, 
        callback : (event : CoreEvent) => any, color = new RGBA()) : TransitionEffectManager {

        this.fadeIn = fadeIn;
        this.speed = speed;
        this.timer = 1.0;
        this.callback = callback;
        this.effectType = type;
        this.color = color.clone();

        this.active = true;
        this.wait = false;

        return this;
    }


    public toggleWaiting(event : boolean) {

        this.wait = event;
    }


    public update(ev : CoreEvent) {

        if (!this.active || this.wait) return;

        if ((this.timer -= this.speed * ev.step) <= 0) {

            this.fadeIn = !this.fadeIn;
            if (!this.fadeIn) {

                this.timer += 1.0;
                this.callback(ev);
            }
            else {

                this.active = false;
                this.timer = 0;
            }
        }
    }


    public draw(canvas : Canvas) {

        if (!this.active || this.effectType == TransitionEffectType.None)
            return;
        
        let oldDepthState = canvas.getDepthTestState();

        canvas.toggleDepthTest(false);
        canvas.transform.loadIdentity();
        canvas.transform.setView2D(canvas.width, canvas.height);
        canvas.transform.use();

        let t = this.timer;
        if (this.fadeIn)
            t = 1.0 - t;

        switch (this.effectType) {

        case TransitionEffectType.Fade:

            canvas.changeShader(ShaderType.NoTextures);
            canvas.setDrawColor(this.color.r, this.color.g, this.color.b, this.color.a * t);
            canvas.drawRectangle(0, 0, canvas.width, canvas.height);
            break;

        default:
            break;
        }
    
        canvas.toggleDepthTest(oldDepthState);
    }


    public isActive = () : boolean => this.active;
}
