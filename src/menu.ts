import { Canvas, ShaderType } from "./core/canvas.js";
import { CoreEvent } from "./core/core.js";
import { negMod } from "./core/mathext.js";
import { State } from "./core/types.js";
import { Vector2, Vector3 } from "./core/vector.js";


export class MenuButton {


    private text : string;
    private callback : (event : CoreEvent) => void;
    public readonly controlWithArrows : boolean;

    private scale : number;
    private scaleTarget : number;


    constructor(text : string, callback : (event : CoreEvent) => void, controlWithArrows = false) {

        this.text = text;
        this.callback = callback;

        this.scale = 1.0;

        this.controlWithArrows = controlWithArrows;
    }


    public getText = () : string => this.text;
    
    public evaluateCallback = (event : CoreEvent) => this.callback(event);


    public clone() : MenuButton {

        return new MenuButton(this.text, this.callback, this.controlWithArrows);
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


    public changeText(newText : string) {

        this.text = newText;
    }
}


export class Menu {


    static BASE_SCALE = 1.25;
    
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

        let activeButton = this.buttons[this.cursorPos];

        if (activeButton.controlWithArrows) {

            activeButton.evaluateCallback(event);
        }
        else if (event.input.getAction("fire1") == State.Pressed ||
            event.input.getAction("start") == State.Pressed) {

            activeButton.evaluateCallback(event);
        }

        for (let i = 0; i < this.buttons.length; ++ i) {

            this.buttons[i].setScale(i == this.cursorPos ? Menu.BASE_SCALE : 1.0);
            this.buttons[i].update(event);            
        }
    }


    public draw(canvas : Canvas, scale = 1, drawBox = false, backgroundAlpha = 0.67, margin = 0) {

        const FONT_COLOR_1 = new Vector3(1, 1, 1);
        const FONT_COLOR_2 = new Vector3(1, 1, 0.33);

        const BASE_OFFSET = 80;
        const BOX_MARGIN_X = 32;
        const BOX_MARGIN_Y = 16;
        const CHAR_OFFSET = -28;

        if (!this.active) return;

        let view = canvas.transform.getViewport();

        let y = view.y / 2;

        let w = (this.width * (64 + CHAR_OFFSET)) * scale;
        let h = this.buttons.length * BASE_OFFSET * scale;

        let color : Vector3;

        if (drawBox) {

            canvas.changeShader(ShaderType.NoTextures);

            if (backgroundAlpha > 0) {

                canvas.setDrawColor(0, 0, 0, backgroundAlpha);
                canvas.drawRectangle(0, 0, canvas.width, canvas.height);
            }

            canvas.setDrawColor(0.33, 0.67, 1.0);
            canvas.drawRectangle(
                view.x/2 - w/2 - (BOX_MARGIN_X+margin), y - h/2 - BOX_MARGIN_Y, 
                w  + (BOX_MARGIN_X+margin)*2, h + BOX_MARGIN_Y*2);

            canvas.changeShader(ShaderType.Textured);
        }

        // canvas.setDrawColor(0, 0, 0);

        y -= h/2;
        for (let b of this.buttons) {

            color = Vector3.lerp(FONT_COLOR_1, FONT_COLOR_2,
                (b.getScale()-1.0) / (Menu.BASE_SCALE - 1.0));

            canvas.setDrawColor(color.x, color.y, color.z);

            canvas.drawText(canvas.getBitmap("font"), b.getText(),
                view.x/2, y, CHAR_OFFSET, 0, true, 
                b.getScale() * scale, 
                b.getScale() * scale);

            y += BASE_OFFSET * scale;
        }
    
        canvas.setDrawColor();
    }


    public isActive = () : boolean => this.active;


    public changeButtonText(index : number, text : string) {

        this.buttons[index].changeText(text);
    }
}
