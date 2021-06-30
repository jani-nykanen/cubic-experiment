import { clamp } from "./core/mathext.js";
import { Menu, MenuButton } from "./menu.js";
export class Settings {
    constructor(event) {
        this.update = (event) => this.menu.update(event);
        this.draw = (canvas) => this.menu.draw(canvas, 0.5, true, 0.33, 24);
        this.isActive = () => this.menu.isActive();
        this.activate = () => this.menu.activate(2);
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
