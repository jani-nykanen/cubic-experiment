import { Canvas } from "./core/canvas.js";
import { CoreEvent } from "./core/core.js";
import { clamp } from "./core/mathext.js";
import { Menu, MenuButton } from "./menu.js";


export class Settings {


    private menu : Menu;


    constructor(event : CoreEvent) {

        this.menu = new Menu(
            [
                new MenuButton("SFX Volume: " + String(this.modifySFXVolume(0, event)),
                event => {

                    let amount = 0;
                    if (event.input.leftPress())
                        -- amount;
                    else if (event.input.rightPress())
                        ++ amount;

                    let newVol : number;
                    
                    if (amount != 0) {

                        newVol = this.modifySFXVolume(amount*10, event) | 0;
                        this.menu.changeButtonText(0, "SFX Volume: " + String(newVol));

                        event.audio.playSample(event.getSample("select"), 0.70);
                    }
                }, true),


                new MenuButton("Music Volume: " + String(this.modifyMusicVolume(0, event)),
                event => {

                    let amount = 0;
                    if (event.input.leftPress())
                        -- amount;
                    else if (event.input.rightPress())
                        ++ amount;

                    let newVol : number;
                    
                    if (amount != 0) {

                        newVol = this.modifyMusicVolume(amount*10, event) | 0;
                        this.menu.changeButtonText(1, "Music Volume: " + String(newVol));

                        event.audio.playSample(event.getSample("select"), 0.70);
                    }
                }, true),

                new MenuButton("Back", event => this.menu.deactivate())
            ]
        );
    }


    private modifySFXVolume(amount : number, event : CoreEvent) : number {

        let vol = Math.round(event.audio.getGlobalSampleVolume()*100) | 0
        vol = clamp(vol + amount, 0, 100);

        event.audio.setGlobalSampleVolume(vol / 100.0);

        return Math.round(event.audio.getGlobalSampleVolume()*100) | 0;
    }


    private modifyMusicVolume(amount : number, event : CoreEvent) : number {

        let vol = Math.round(event.audio.getGlobalMusicVolume()*100) | 0
        vol = clamp(vol + amount, 0, 100);

        event.audio.setGlobalMusicVolume(vol / 100.0);

        return Math.round(event.audio.getGlobalMusicVolume()*100) | 0;
    }

    public update = (event : CoreEvent) : void => this.menu.update(event);

    public draw = (canvas : Canvas, bgAlpha = 0.33) : void => this.menu.draw(canvas, 0.5, true, bgAlpha, 24);


    public isActive = () : boolean => this.menu.isActive();
    public activate = () : void => this.menu.activate(2);
    public deactivate = () : void => this.menu.deactivate();
}
