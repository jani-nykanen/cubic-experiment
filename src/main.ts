import { AudioIntro } from "./audiointro.js";
import { Core } from "./core/core.js"


window.onload = () : void => (new Core())
    .addInputAction("fire1", "Space", 0)
    .addInputAction("fire2", "ShiftLeft", 2)
    .addInputAction("start", "Enter", 9, 7)
    .addInputAction("back", "Escape", 8, 6)
    .addInputAction("reset", "KeyR", 3)
    .loadAssets("assets/index.json")
    .run(AudioIntro,
        event => {

            event.audio.setGlobalMusicVolume(0.0);
            event.audio.setGlobalSampleVolume(0.0);
            event.audio.toggle(true);
        });

