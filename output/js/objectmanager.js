import { Vector3 } from "./core/vector.js";
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
        if (this.player == null) {
            this.player = new Player(x, y, z, event);
        }
        else {
            this.player.reset(new Vector3(x, y, z));
        }
    }
    reset() {
        this.player.reset();
    }
}
