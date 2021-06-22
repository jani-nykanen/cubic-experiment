import { clamp } from "./core/mathext.js";
import { Vector2, Vector3 } from "./core/vector.js";
import { ShapeGenerator } from "./shapegen.js";
export class Player {
    constructor(x, y, z, event) {
        this.startPos = new Vector3(x, y, z);
        this.reset();
        this.shadow = (new ShapeGenerator())
            .addHorizontalPlane(-0.5, 0, -0.5, 1, 1)
            .generateMesh(event);
        this.shadowSize = new Vector2(0, 0);
    }
    control(stage, event) {
        const EPS = 0.25;
        const EPS2 = 0.01;
        if (this.moving || this.falling)
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
        if (stage.getHeight(this.target.x, this.target.z) > this.pos.y) {
            this.target = this.pos.clone();
            return;
        }
        this.moving = true;
        this.moveTimer = 0;
    }
    checkFalling(stage) {
        let height = stage.getHeight(this.pos.x, this.pos.z);
        if (height == this.pos.y)
            return;
        this.target = new Vector3(this.pos.x, height, this.pos.z);
        // this.direction = new Vector3(0, -1, 0);
        this.falling = true;
        this.gravity = 0;
    }
    fall(event) {
        const GRAVITY_DELTA = 0.015;
        this.gravity += GRAVITY_DELTA * event.step;
        this.renderPos.y -= this.gravity * event.step;
        if (this.renderPos.y < this.target.y) {
            this.pos = this.target.clone();
            this.renderPos = this.pos.clone();
            this.falling = false;
            this.gravity = 0;
        }
    }
    move(stage, event) {
        if (this.falling) {
            this.fall(event);
            return;
        }
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
            this.checkFalling(stage);
            return;
        }
        let t = this.moveTimer / Player.MOVE_TIME;
        this.renderPos = Vector3.lerp(this.pos, this.target, t);
        this.angle.z = t * this.direction.x * Math.PI / 2;
        this.angle.x = t * -this.direction.z * Math.PI / 2;
        this.jump = 1.0 / Math.SQRT2 * Math.sin(t * Math.PI) * (1.0 - 1.0 / Math.SQRT2);
    }
    update(stage, event) {
        this.control(stage, event);
        this.move(stage, event);
    }
    drawShadow(canvas) {
        const MAX_ALPHA = 0.5;
        const COMPARE = 4;
        let alpha;
        if (this.falling) {
            alpha = clamp(1.0 - (this.renderPos.y - this.target.y) / COMPARE, 0, 1);
        }
        else if (this.moving) {
            alpha = this.moveTimer / Player.MOVE_TIME;
        }
        canvas.setDrawColor(0, 0, 0, alpha * MAX_ALPHA);
        canvas.transform.push();
        canvas.transform.translate(this.target.x + 0.5, this.target.y + 0.001, -this.target.z - 0.5);
        canvas.transform.use();
        canvas.drawMesh(this.shadow);
        canvas.transform.pop();
        canvas.setDrawColor();
        canvas.setDrawColor(0, 0, 0, (1.0 - alpha) * MAX_ALPHA);
        canvas.transform.push();
        canvas.transform.translate(this.pos.x + 0.5, this.pos.y + 0.001, -this.pos.z - 0.5);
        canvas.transform.use();
        canvas.drawMesh(this.shadow);
        canvas.transform.pop();
        canvas.setDrawColor();
    }
    draw(canvas) {
        if (this.falling || this.moving)
            this.drawShadow(canvas);
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
    reset() {
        this.pos = this.startPos.clone();
        this.target = this.pos.clone();
        this.renderPos = this.pos.clone();
        this.direction = new Vector3();
        this.angle = new Vector3();
        this.moveTimer = 0;
        this.moving = false;
        this.falling = false;
        this.gravity = 0;
        this.jump = 0;
    }
}
Player.MOVE_TIME = 30;
