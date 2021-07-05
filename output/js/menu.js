import { ShaderType } from "./core/canvas.js";
import { negMod } from "./core/mathext.js";
import { State } from "./core/types.js";
import { Vector3 } from "./core/vector.js";
export class MenuButton {
    constructor(text, callback, controlWithArrows = false) {
        this.getText = () => this.text;
        this.evaluateCallback = (event) => this.callback(event);
        this.getScale = () => this.scale;
        this.text = text;
        this.callback = callback;
        this.scale = 1.0;
        this.controlWithArrows = controlWithArrows;
    }
    clone() {
        return new MenuButton(this.text, this.callback, this.controlWithArrows);
    }
    setScale(target, force = false) {
        this.scaleTarget = target;
        if (force)
            this.scale = this.scaleTarget;
    }
    update(event) {
        const SCALE_SPEED = 0.0225;
        if (this.scale < this.scaleTarget) {
            this.scale = Math.min(this.scaleTarget, this.scale + SCALE_SPEED * event.step);
        }
        else {
            this.scale = Math.max(this.scaleTarget, this.scale - SCALE_SPEED * event.step);
        }
    }
    changeText(newText) {
        this.text = newText;
    }
}
export class Menu {
    constructor(buttons) {
        this.isActive = () => this.active;
        this.buttons = (new Array(buttons.length))
            .fill(null)
            .map((b, i) => buttons[i].clone());
        this.cursorPos = 0;
        this.active = false;
        this.width = Math.max(...this.buttons.map(b => b.getText().length));
    }
    activate(cursorPos = -1) {
        if (cursorPos >= 0)
            this.cursorPos = cursorPos % this.buttons.length;
        this.active = true;
        for (let i = 0; i < this.buttons.length; ++i) {
            this.buttons[i].setScale(i == this.cursorPos ? Menu.BASE_SCALE : 1.0, true);
        }
    }
    deactivate() {
        this.active = false;
    }
    update(event) {
        if (!this.active)
            return;
        let oldPos = this.cursorPos;
        if (event.input.upPress()) {
            --this.cursorPos;
        }
        else if (event.input.downPress()) {
            ++this.cursorPos;
        }
        if (oldPos != this.cursorPos) {
            event.audio.playSample(event.getSample("select"), 0.70);
            this.cursorPos = negMod(this.cursorPos, this.buttons.length);
        }
        let activeButton = this.buttons[this.cursorPos];
        if (activeButton.controlWithArrows) {
            activeButton.evaluateCallback(event);
        }
        else if (event.input.getAction("fire1") == State.Pressed ||
            event.input.getAction("start") == State.Pressed) {
            activeButton.evaluateCallback(event);
            event.audio.playSample(event.getSample("choose"), 0.70);
        }
        for (let i = 0; i < this.buttons.length; ++i) {
            this.buttons[i].setScale(i == this.cursorPos ? Menu.BASE_SCALE : 1.0);
            this.buttons[i].update(event);
        }
    }
    draw(canvas, scale = 1, drawBox = false, backgroundAlpha = 0.67, margin = 0, header) {
        const FONT_COLOR_1 = new Vector3(1, 1, 1);
        const FONT_COLOR_2 = new Vector3(1, 1, 0.33);
        const BASE_OFFSET = 80;
        const BOX_MARGIN_X = 32;
        const BOX_MARGIN_Y = 16;
        const CHAR_OFFSET = -28;
        const SHADOW_OFFSET = 8;
        if (!this.active)
            return;
        let view = canvas.transform.getViewport();
        let y = view.y / 2;
        let len = this.buttons.length;
        let width = this.width;
        if (header != null) {
            len += 2;
            width = Math.max(width, header.length);
        }
        let w = (width * (64 + CHAR_OFFSET)) * scale;
        let h = len * BASE_OFFSET * scale;
        let color;
        if (drawBox) {
            canvas.changeShader(ShaderType.NoTextures);
            if (backgroundAlpha > 0) {
                canvas.setDrawColor(0, 0, 0, backgroundAlpha);
                canvas.drawRectangle(0, 0, canvas.width, canvas.height);
            }
            canvas.setDrawColor(0.33, 0.67, 1.0);
            canvas.drawRectangle(view.x / 2 - w / 2 - (BOX_MARGIN_X + margin), y - h / 2 - BOX_MARGIN_Y, w + (BOX_MARGIN_X + margin) * 2, h + BOX_MARGIN_Y * 2);
            canvas.changeShader(ShaderType.Textured);
        }
        // canvas.setDrawColor(0, 0, 0);
        y -= h / 2;
        if (header != null) {
            canvas.setDrawColor();
            canvas.drawTextWithShadow(canvas.getBitmap("font"), header, view.x / 2, y + BASE_OFFSET * scale / 2, CHAR_OFFSET, 0, true, 0.5, 0.5, 4, 4, 0.33);
            y += BASE_OFFSET * 2 * scale;
        }
        for (let b of this.buttons) {
            color = Vector3.lerp(FONT_COLOR_1, FONT_COLOR_2, (b.getScale() - 1.0) / (Menu.BASE_SCALE - 1.0));
            canvas.setDrawColor(color.x, color.y, color.z);
            canvas.drawTextWithShadow(canvas.getBitmap("font"), b.getText(), view.x / 2, y, CHAR_OFFSET, 0, true, b.getScale() * scale, b.getScale() * scale, SHADOW_OFFSET * scale, SHADOW_OFFSET * scale, 0.33);
            y += BASE_OFFSET * scale;
        }
        canvas.setDrawColor();
    }
    changeButtonText(index, text) {
        this.buttons[index].changeText(text);
    }
}
Menu.BASE_SCALE = 1.25;
