import { Canvas } from "./core/canvas.js";
import { Core, CoreEvent } from "./core/core.js";
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

        this.player = new Player(x, y, z, event);
    }


    public reset() {

        this.player.reset();
    }
}
