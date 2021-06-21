import { Canvas } from "./core/canvas.js";
import { CoreEvent } from "./core/core.js";
import { Vector2, Vector3 } from "./core/vector.js";



export class Player {


    static MOVE_TIME = 30;


    private pos : Vector3
    private target : Vector3;
    private renderPos : Vector3;

    private direction : Vector3;
    private angle : Vector3;
    private startAngle : Vector3;

    private moving : boolean;
    private moveTimer : number;


    constructor(x : number, y : number, z : number) {

        this.pos = new Vector3(x, y, z);
        this.target = this.pos.clone();
        this.renderPos = this.pos.clone();
    
        this.direction = new Vector3();
        this.angle = new Vector3();
        this.startAngle = this.angle.clone();
        
        this.moveTimer = 0;
        this.moving = false;
    }


    private control(event : CoreEvent) {

        const EPS = 0.25;

        if (this.moving) return;

        let dx = 0;
        let dz = 0;

        if (event.input.getStick().length() < EPS) return;

        let s = Vector2.max(event.input.getStick(), 1.0);

        if (Math.abs(s.x) > Math.abs(s.y)) {

            dx = Math.sign(s.x);
        }
        else if (Math.abs(s.x) < Math.abs(s.y)) {

            dz = -Math.sign(s.y);
        }

        this.direction = new Vector3(dx, 0, dz);
        this.target = Vector3.add(this.pos, this.direction);

        this.moving = true;
        this.moveTimer = 0;

        this.startAngle = this.angle.clone();
    }


    private move(event : CoreEvent) {

        if (!this.moving) {

            this.moveTimer = 0;
            return;
        }

        if ((this.moveTimer += event.step) >= Player.MOVE_TIME) {

            this.moveTimer -= Player.MOVE_TIME;
            this.moving = false;
            this.pos = this.target.clone();

            this.renderPos = this.pos.clone();

            return;
        }

        let t = this.moveTimer / Player.MOVE_TIME;

        this.renderPos = Vector3.lerp(this.pos, this.target, t);

        this.angle.z = this.startAngle.z + t * this.direction.x * Math.PI/2;
        this.angle.x = this.startAngle.x + t * this.direction.z * Math.PI/2;
    }


    public update(event : CoreEvent) {

        this.control(event);
        this.move(event);
    }


    public draw(canvas : Canvas) {

        canvas.transform.push();
        canvas.transform.translate(this.renderPos.x, this.renderPos.y, this.renderPos.z);
        canvas.transform.rotate(this.angle.x, new Vector3(1, 0, 0));
        canvas.transform.rotate(-this.angle.z, new Vector3(0, 0, 1));
        canvas.transform.use();

        canvas.bindTexture(canvas.getBitmap("crate"));
        canvas.drawModel(canvas.getModel("cube"));
    
        canvas.transform.pop();
    }

}
