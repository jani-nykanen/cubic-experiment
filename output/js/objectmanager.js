import { Player } from "./player.js";
export class ObjectManager {
    constructor(stage, event) {
        stage.parseObjectLayer(this, event);
    }
    update(stage, event) {
        this.player.update(stage, event);
    }
    draw(canvas) {
        this.player.draw(canvas);
    }
    createPlayer(x, y, z, event) {
        this.player = new Player(x, y, z, event);
    }
    reset() {
        this.player.reset();
    }
}
