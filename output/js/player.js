import { Vector2, Vector3 } from "./core/vector.js";
import { ShapeGenerator } from "./shapegen.js";
import { TileEffect } from "./stage.js";
export class Player {
    /*
    private meshShadowXY : Mesh;
    private meshShadowYZ : Mesh;
    private wallShadows : Array<boolean>;
    */
    constructor(x, y, z, event) {
        this.startPos = new Vector3(x, y, z);
        this.reset();
        this.meshShadowXZ = (new ShapeGenerator())
            .addHorizontalPlane(-0.5, 0, -0.5, 1, 1)
            .generateMesh(event);
        /*
        this.meshShadowXY = (new ShapeGenerator())
            .addVerticalPlaneXY(-0.5, -0.5, 0, 1, 1)
            .generateMesh(event);
        this.meshShadowYZ = (new ShapeGenerator())
            .addVerticalPlaneYZ(0, -0.5, -0.5, 1, 1)
            .generateMesh(event);
        */
    }
    reset() {
        this.pos = this.startPos.clone();
        this.target = this.pos.clone();
        this.renderPos = this.pos.clone();
        this.direction = new Vector3();
        this.angle = new Vector3();
        this.moveTimer = 0;
        this.moving = false;
        this.automaticMovement = false;
        this.falling = false;
        this.gravity = 0;
        this.jump = 0;
        this.targetHeight = this.pos.y;
        this.shrinkMode = 0;
        this.shrinkTimer = 0;
        this.teleportationTarget = this.pos.clone();
    }
    control(stage, event) {
        const EPS = 0.25;
        const EPS2 = 0.01;
        if (this.moving || this.falling)
            return;
        let dx = 0;
        let dz = 0;
        let automaticDir;
        this.automaticMovement = false;
        automaticDir = stage.checkAutomaticArrows(this.pos.x, this.pos.y, this.pos.z);
        if (automaticDir != null) {
            if (stage.getHeight(this.pos.x + automaticDir.x, this.pos.z + automaticDir.y) > this.pos.y) {
                automaticDir = null;
            }
            else {
                dx = automaticDir.x;
                dz = automaticDir.y;
                this.automaticMovement = true;
            }
        }
        // Can't use "else if" here, since automaticDir is modified in
        // the previous block
        if (automaticDir == null) {
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
            if (stage.getHeight(this.pos.x + dx, this.pos.z + dz) > this.pos.y) {
                this.target = this.pos.clone();
                this.direction.zeros();
                return;
            }
        }
        this.direction = new Vector3(dx, 0, dz);
        this.target = Vector3.add(this.pos, this.direction);
        this.targetHeight = stage.getHeight(this.target.x, this.target.z);
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
        this.targetHeight = height;
    }
    fall(stage, event) {
        const GRAVITY_DELTA = 0.015;
        this.gravity += GRAVITY_DELTA * event.step;
        this.renderPos.y -= this.gravity * event.step;
        if (this.renderPos.y < this.target.y) {
            this.pos = this.target.clone();
            this.renderPos = this.pos.clone();
            this.falling = false;
            this.gravity = 0;
            this.checkTile(stage);
        }
    }
    teleportTo(point) {
        this.teleportationTarget = point.clone();
        this.shrinkMode = 2;
        this.shrinkTimer = Player.SHRINK_TIME;
        /*
        this.pos = point.clone();
        this.target = this.pos.clone();
        this.renderPos = this.pos.clone();
        */
    }
    checkTile(stage) {
        let res = stage.checkTile(this.pos.x, this.pos.y, this.pos.z);
        switch (res) {
            case TileEffect.Teleportation:
                this.teleportTo(stage.findTeleporter(this.pos.x, this.pos.z));
                break;
            default:
                break;
        }
    }
    move(stage, event) {
        if (this.falling) {
            this.fall(stage, event);
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
            this.automaticMovement = false;
            this.checkFalling(stage);
            if (!this.falling) {
                this.checkTile(stage);
            }
            return;
        }
        let t = this.moveTimer / Player.MOVE_TIME;
        this.renderPos = Vector3.lerp(this.pos, this.target, t);
        this.angle.z = t * this.direction.x * Math.PI / 2;
        this.angle.x = t * -this.direction.z * Math.PI / 2;
        if (!this.automaticMovement) {
            this.jump = 1.0 / Math.SQRT2 * Math.sin(t * Math.PI) * (1.0 - 1.0 / Math.SQRT2);
        }
    }
    shrink(event) {
        if ((this.shrinkTimer -= event.step) <= 0) {
            --this.shrinkMode;
            if (this.shrinkMode > 0) {
                this.shrinkTimer += Player.SHRINK_TIME;
            }
            if (this.shrinkMode == 1) {
                this.pos = this.teleportationTarget.clone();
                this.target = this.pos.clone();
            }
        }
        this.renderPos = this.pos.clone();
    }
    update(stage, event) {
        if (stage.isEventHappening())
            return;
        if (this.shrinkMode > 0) {
            this.shrink(event);
            return;
        }
        this.control(stage, event);
        this.move(stage, event);
        stage.setSpecialShadow(this.target.x, this.target.z, this.pos.x, this.pos.z, this.moving ? this.moveTimer / Player.MOVE_TIME : 1.0);
    }
    drawShadow(canvas) {
        const Y_OFF = 0.00125;
        const ALPHA = 0.33;
        let t = this.moveTimer / Player.MOVE_TIME;
        canvas.setDrawColor(0, 0, 0, ALPHA);
        if (this.falling || this.target.y == this.targetHeight) {
            canvas.transform.push();
            canvas.transform.translate(this.renderPos.x + 0.5, this.targetHeight + Y_OFF, -this.renderPos.z - 0.5);
            canvas.transform.use();
            canvas.drawMesh(this.meshShadowXZ);
            canvas.transform.pop();
            canvas.setDrawColor();
        }
        else {
            // Back
            canvas.transform.push();
            canvas.transform.translate(this.pos.x + 0.5 + this.direction.x * t * 0.5, this.pos.y + Y_OFF, -this.pos.z - 0.5 - this.direction.z * t * 0.5);
            canvas.transform.scale(1.0 - t * Math.abs(this.direction.x), 1, 1.0 - t * Math.abs(this.direction.z));
            canvas.transform.use();
            canvas.drawMesh(this.meshShadowXZ);
            canvas.transform.pop();
            // Front
            canvas.transform.push();
            canvas.transform.translate(this.pos.x + 0.5 + this.direction.x * t * 1.0, this.targetHeight + Y_OFF, -this.pos.z - 0.5 - this.direction.z * t * 1.0);
            canvas.transform.scale(1.0 - (1.0 - t) * Math.abs(this.direction.x), 1, 1.0 - (1.0 - t) * Math.abs(this.direction.z));
            canvas.transform.use();
            canvas.drawMesh(this.meshShadowXZ);
            canvas.transform.pop();
        }
        canvas.setDrawColor();
    }
    draw(canvas) {
        if (this.falling || this.moving)
            this.drawShadow(canvas);
        let t;
        canvas.transform.push();
        canvas.transform.translate(this.renderPos.x + 0.5, this.renderPos.y + 0.5 + this.jump, -this.renderPos.z - 0.5);
        if (this.shrinkMode > 0) {
            t = this.shrinkTimer / Player.SHRINK_TIME;
            if (this.shrinkMode == 1)
                t = 1.0 - t;
            canvas.transform.translate(0, -0.5 * (1 - t), 0);
            canvas.transform.scale(t, t, t);
        }
        if (!this.automaticMovement) {
            canvas.transform.rotate(this.angle.x, new Vector3(1, 0, 0));
            canvas.transform.rotate(-this.angle.z, new Vector3(0, 0, 1));
        }
        canvas.transform.use();
        canvas.setDrawColor(1, 0.33, 0.33);
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
Player.SHRINK_TIME = 20;
