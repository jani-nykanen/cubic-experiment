import { Core } from "./core/core.js";
import { GameScene } from "./game.js";
window.onload = () => (new Core())
    .addInputAction("fire1", "Space", 0)
    .addInputAction("fire2", "ShiftLeft", 2)
    .addInputAction("start", "Enter", 9, 7)
    .addInputAction("back", "Escape", 8, 6)
    .addInputAction("debug", "KeyP")
    .loadAssets("assets/index.json")
    .run(GameScene);
