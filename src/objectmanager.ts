import { Canvas } from "./core/canvas.js";
import { Core, CoreEvent } from "./core/core.js";
import { Vector3 } from "./core/vector.js";
import { Player } from "./player.js";
import { Stage } from "./stage.js";



export class ObjectManager {


    private player : Player;

    
    constructor(stage : Stage, event : CoreEvent) {

        stage.parseObjectLayer(this, event);
    }


    public update(stage : Stage, event : CoreEvent) {

        this.player.update(stage, event);
    }


    public draw(canvas : Canvas) {

        this.player.draw(canvas);
    }


    public createPlayer(x : number, y : number, z : number, event : CoreEvent) {

        if (this.player == null) {

            this.player = new Player(x, y, z, event);
        }
        else {

            this.player.reset(new Vector3(x, y, z));
        }
    }


    public reset() {

        this.player.reset();
    }


    public dispose(event : CoreEvent) {

        this.player.dispose(event);
    }
}
