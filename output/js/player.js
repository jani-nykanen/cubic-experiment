import { Vector2, Vector3 } from "./core/vector.js";
export class Player {
    constructor(x, y, z) {
        this.pos = new Vector3(x, y, z);
        this.target = this.pos.clone();
        this.renderPos = this.pos.clone();
        this.direction = new Vector3();
        this.angle = new Vector3();
        this.moveTimer = 0;
        this.moving = false;
        this.jump = 0;
    }
    control(event) {
        const EPS = 0.25;
        const EPS2 = 0.01;
        if (this.moving)
            return;
        let dx = 0;
        let dz = 0;
        if (event.input.getStick().length() < EPS)
            return;
        let s = Vector2.max(event.input.getStick(), 1.0);
        if (Math.abs(s.x) > Math.abs(s.y)) {
            dx = Math.sign(s.x);
        }
        else if (Math.abs(s.x) < Math.abs(s.y)) {
            dz = Math.sign(s.y);
        }
        if (Math.abs(dx) < EPS2 && Math.abs(dz) < EPS2)
            return;
        this.direction = new Vector3(dx, 0, dz);
        this.target = Vector3.add(this.pos, this.direction);
        this.moving = true;
        this.moveTimer = 0;
    }
    move(event) {
        if (!this.moving) {
            this.moveTimer = 0;
            return;
        }
        if ((this.moveTimer += event.step) >= Player.MOVE_TIME) {
            this.moveTimer -= Player.MOVE_TIME;
            this.moving = false;
            this.pos = this.target.clone();
            this.renderPos = this.pos.clone();
            this.angle.zeros();
            this.jump = 0;
            return;
        }
        let t = this.moveTimer / Player.MOVE_TIME;
        this.renderPos = Vector3.lerp(this.pos, this.target, t);
        this.angle.z = t * this.direction.x * Math.PI / 2;
        this.angle.x = t * -this.direction.z * Math.PI / 2;
        this.jump = 1.0 / Math.SQRT2 * Math.sin(t * Math.PI) * (1.0 - 1.0 / Math.SQRT2);
    }
    update(event) {
        this.control(event);
        this.move(event);
    }
    draw(canvas) {
        canvas.transform.push();
        canvas.transform.translate(this.renderPos.x + 0.5, this.renderPos.y + 0.5 + this.jump, -this.renderPos.z - 0.5);
        canvas.transform.rotate(this.angle.x, new Vector3(1, 0, 0));
        canvas.transform.rotate(-this.angle.z, new Vector3(0, 0, 1));
        canvas.transform.use();
        canvas.setDrawColor(1, 0.5, 0.5);
        canvas.drawModel(canvas.getModel("cube"));
        canvas.setDrawColor();
        canvas.transform.pop();
    }
    drawDebug(canvas) {
        let font = canvas.getBitmap("font");
        canvas.drawText(font, "X: " + String(this.pos.x | 0) + "\nZ: " + String(this.pos.z | 0), 8, 8, -32, 0, false, 0.5, 0.5);
    }
}
Player.MOVE_TIME = 30;
