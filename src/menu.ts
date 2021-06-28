import { Canvas, ShaderType } from "./core/canvas.js";
import { CoreEvent } from "./core/core.js";
import { negMod } from "./core/mathext.js";
import { State } from "./core/types.js";


export class MenuButton {


    private text : string;
    private callback : (event : CoreEvent) => void;

    private scale : number;
    private scaleTarget : number;


    constructor(text : string, callback : (event : CoreEvent) => void) {

        this.text = text;
        this.callback = callback;

        this.scale = 1.0;
    }


    public getText = () : string => this.text;
    
    public evaluateCallback = (event : CoreEvent) => this.callback(event);


    public clone() : MenuButton {

        return new MenuButton(this.text, this.callback);
    }


    public setScale(target : number, force = false) {

        this.scaleTarget = target;

        if (force)
            this.scale = this.scaleTarget;
    }


    public getScale = () : number => this.scale;


    public update(event : CoreEvent) {

        const SCALE_SPEED = 0.0225;

        if (this.scale < this.scaleTarget) {
        
            this.scale = Math.min(this.scaleTarget, 
                this.scale + SCALE_SPEED*event.step);
        }
        else {

            this.scale = Math.max(this.scaleTarget,  
                this.scale - SCALE_SPEED*event.step);
        }
    }
}


export class Menu {


    static BASE_SCALE = 1.33;
    
    private buttons : Array<MenuButton>;

    private cursorPos : number;
    private active : boolean;

    private width : number;


    constructor(buttons : Array<MenuButton>) {

        this.buttons = (new Array<MenuButton> (buttons.length))
            .fill(null)
            .map((b, i) => buttons[i].clone());

        this.cursorPos = 0;
        this.active = false;

        this.width = Math.max(
            ...this.buttons.map(b => b.getText().length)
        );
    }


    public activate(cursorPos = -1) {

        if (cursorPos >= 0)
            this.cursorPos = cursorPos % this.buttons.length;

        this.active = true;

        for (let i = 0; i < this.buttons.length; ++ i) {

            this.buttons[i].setScale(i == this.cursorPos ? Menu.BASE_SCALE : 1.0, true);         
        }
    }


    public deactivate() {

        this.active = false;
    }


    public update(event : CoreEvent) {

        if (!this.active) return;

        let oldPos = this.cursorPos;

        if (event.input.upPress()) {

            -- this.cursorPos;
        }
        else if (event.input.downPress()) {

            ++ this.cursorPos;
        }

        if (oldPos != this.cursorPos) {

            // TODO: Sound effect

            this.cursorPos = negMod(this.cursorPos, this.buttons.length);
        }

        if (event.input.getAction("fire1") == State.Pressed ||
            event.input.getAction("start") == State.Pressed) {

            this.buttons[this.cursorPos].evaluateCallback(event);
        }

        for (let i = 0; i < this.buttons.length; ++ i) {

            this.buttons[i].setScale(i == this.cursorPos ? Menu.BASE_SCALE : 1.0);
            this.buttons[i].update(event);            
        }
    }


    public draw(canvas : Canvas, scale = 1, drawBox = false, boxAlpha = 0.67) {

        const BASE_OFFSET = 80;
        const BOX_MARGIN_X = 32;
        const BOX_MARGIN_Y = 16;
        const CHAR_OFFSET = -28;

        if (!this.active) return;

        let view = canvas.transform.getViewport();

        let y = view.y / 2;

        let w = (this.width * (64 + CHAR_OFFSET)) * scale;
        let h = this.buttons.length * BASE_OFFSET * scale;

        if (drawBox) {

            canvas.changeShader(ShaderType.NoTextures);

            if (boxAlpha > 0) {

                canvas.setDrawColor(0, 0, 0, boxAlpha);
                canvas.drawRectangle(0, 0, canvas.width, canvas.height);
            }

            canvas.setDrawColor(0.90, 0.90, 0.90);
            canvas.drawRectangle(
                view.x/2 - w/2 - BOX_MARGIN_X, y - h/2 - BOX_MARGIN_Y, 
                w  + BOX_MARGIN_X*2, h + BOX_MARGIN_Y*2);

            canvas.changeShader(ShaderType.Textured);
        }

        canvas.setDrawColor(0, 0, 0);

        y -= h/2;
        for (let i = 0; i < this.buttons.length; ++ i) {

            canvas.drawText(canvas.getBitmap("font"), this.buttons[i].getText(),
                view.x/2, y, CHAR_OFFSET, 0, true, 
                this.buttons[i].getScale() * scale, 
                this.buttons[i].getScale() * scale);

            y += BASE_OFFSET * scale;
        }
    
        canvas.setDrawColor();
    }


    public isActive = () : boolean => this.active;
}
