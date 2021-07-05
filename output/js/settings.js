import { clamp } from "./core/mathext.js";
import { Menu, MenuButton } from "./menu.js";
export class Settings {
    constructor(event) {
        this.update = (event) => this.menu.update(event);
        this.draw = (canvas, bgAlpha = 0.33) => this.menu.draw(canvas, 0.5, true, bgAlpha, 24);
        this.isActive = () => this.menu.isActive();
        this.activate = () => this.menu.activate(3);
        this.deactivate = () => this.menu.deactivate();
        this.menu = new Menu([
            new MenuButton("SFX Volume: " + String(this.modifySFXVolume(0, event)), event => {
                let amount = 0;
                if (event.input.leftPress())
                    --amount;
                else if (event.input.rightPress())
                    ++amount;
                let newVol;
                if (amount != 0) {
                    newVol = this.modifySFXVolume(amount * 10, event) | 0;
                    this.menu.changeButtonText(0, "SFX Volume: " + String(newVol));
                    event.audio.playSample(event.getSample("select"), 0.70);
                }
            }, true),
            new MenuButton("Music Volume: " + String(this.modifyMusicVolume(0, event)), event => {
                let amount = 0;
                if (event.input.leftPress())
                    --amount;
                else if (event.input.rightPress())
                    ++amount;
                let newVol;
                if (amount != 0) {
                    newVol = this.modifyMusicVolume(amount * 10, event) | 0;
                    this.menu.changeButtonText(1, "Music Volume: " + String(newVol));
                    event.audio.playSample(event.getSample("select"), 0.70);
                }
            }, true),
            new MenuButton("Control Mode: " + ["A", "B"][clamp(event.getControlMode(), 0, 1)], event => {
                let mode = event.getControlMode();
                let oldMode = mode;
                if (event.input.leftPress() || event.input.rightPress())
                    mode = Number(!Boolean(mode));
                if (oldMode != mode) {
                    event.changeControlMode(mode);
                    this.menu.changeButtonText(2, "Control Mode: " + ["A", "B"][clamp(event.getControlMode(), 0, 1)]);
                    event.audio.playSample(event.getSample("select"), 0.70);
                }
            }, true),
            new MenuButton("Back", event => this.menu.deactivate())
        ]);
    }
    modifySFXVolume(amount, event) {
        let vol = Math.round(event.audio.getGlobalSampleVolume() * 100) | 0;
        vol = clamp(vol + amount, 0, 100);
        event.audio.setGlobalSampleVolume(vol / 100.0);
        return Math.round(event.audio.getGlobalSampleVolume() * 100) | 0;
    }
    modifyMusicVolume(amount, event) {
        let vol = Math.round(event.audio.getGlobalMusicVolume() * 100) | 0;
        vol = clamp(vol + amount, 0, 100);
        event.audio.setGlobalMusicVolume(vol / 100.0);
        return Math.round(event.audio.getGlobalMusicVolume() * 100) | 0;
    }
}
