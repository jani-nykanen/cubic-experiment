import { Vector2, Vector3 } from "./core/vector.js";
import { ShapeGenerator } from "./shapegen.js";
export var TileEffect;
(function (TileEffect) {
    TileEffect[TileEffect["None"] = 0] = "None";
    TileEffect[TileEffect["StarObtained"] = 1] = "StarObtained";
    TileEffect[TileEffect["ButtonPressed"] = 2] = "ButtonPressed";
    TileEffect[TileEffect["Teleportation"] = 3] = "Teleportation";
    TileEffect[TileEffect["IncreasingWall"] = 4] = "IncreasingWall";
})(TileEffect || (TileEffect = {}));
;
var SpecialEvent;
(function (SpecialEvent) {
    SpecialEvent[SpecialEvent["None"] = 0] = "None";
    SpecialEvent[SpecialEvent["ToggleWalls"] = 1] = "ToggleWalls";
    SpecialEvent[SpecialEvent["RotateArrows"] = 2] = "RotateArrows";
    SpecialEvent[SpecialEvent["IncreasingWall"] = 3] = "IncreasingWall";
})(SpecialEvent || (SpecialEvent = {}));
;
export class Stage {
    constructor(stageIndex, event) {
        this.isEventHappening = () => this.eventHappening;
        this.getStarCount = () => this.totalStars;
        this.getCameraScale = () => this.cameraScale;
        this.getScaledEventTime = () => 1.0 - this.eventTimer / Stage.EVENT_TIME;
        this.index = stageIndex - 1;
        this.nextStage(event);
        let gen = new ShapeGenerator();
        this.meshStarShape = gen.generateStar(0.50, 0.5, 5, event);
        this.meshButton = gen.generateCylinderFromPath(t => new Vector2(0.45 * Math.cos(t * Math.PI * 2), 0.45 * Math.sin(t * Math.PI * 2)), 32, 1.0, event);
        this.meshButton2 = gen.generateCylinderFromRegularPolygon(6, 0.50, 1.0, event);
        this.generateStarShadow(event);
        this.meshCross = gen.addHorizontalPlane(-0.5, 0, -0.1, 1.0, 0.2, 1)
            .addHorizontalPlane(-0.1, 0, -0.5, 0.2, 1.0, 1)
            .generateMesh(event);
        this.meshSpecialWall = gen.addHorizontalPlane(-0.5, 0.0, -0.5, 1, 1, 1)
            .addVerticalPlaneXY(-0.5, -1.0, -0.5, 1.0, 1.0)
            .addVerticalPlaneYZ(0.5, -1.0, -0.5, 1.0, 1.0)
            .generateMesh(event);
        this.meshArrow = gen.addTriangle(new Vector3(-0.35, 0.0, -0.175), new Vector3(0.0, 0.0, 0.175), new Vector3(0.35, 0.0, -0.175), 1.0)
            .generateMesh(event);
        this.meshRing = gen
            .addHorizontalPlane(-0.5, 0.0, -0.5, 1.0, 0.1, 1)
            .addHorizontalPlane(-0.5, 0.0, 0.4, 1.0, 0.1, 1)
            .addHorizontalPlane(-0.5, 0.0, -0.4, 0.1, 0.8, 1)
            .addHorizontalPlane(0.4, 0.0, -0.4, 0.1, 0.8, 1)
            .generateMesh(event);
        this.meshCircle = gen.generateCircle(0.35, 0.20, 32, event, -1);
    }
    nextStage(event) {
        if (this.meshTerrain != null) {
            event.disposeMesh(this.meshTerrain);
            this.meshTerrain = null;
        }
        ++this.index;
        this.baseMap = event.assets.getTilemap(String(this.index));
        this.width = this.baseMap.width;
        this.depth = this.baseMap.height;
        this.height = this.baseMap.max(0);
        this.cameraScale = Number(this.baseMap.getProperty("scale"));
        this.heightMap = this.baseMap.cloneLayer(0);
        this.createTerrainMesh(event);
        this.reset();
    }
    computeInitialStarCount() {
        this.totalStars = 0;
        for (let i of this.objectLayer) {
            if (i == 10)
                ++this.totalStars;
        }
    }
    computeHeightmap() {
        this.heightMap = this.baseMap.cloneLayer(0);
        for (let i = 0; i < this.heightMap.length; ++i) {
            if (this.objectLayer[i] == 13) {
                ++this.heightMap[i];
            }
        }
    }
    reset() {
        this.objectLayer = this.baseMap.cloneLayer(1);
        this.computeHeightmap();
        this.starAngle = 0;
        this.arrowBlinkTimer = 0;
        this.ringTimer = 0;
        this.eventHappening = false;
        this.eventType = SpecialEvent.None;
        this.eventTimer = 0;
        this.specialShadowValue = 0.0;
        this.specialShadowPos = (new Array(2)).fill(null).map(i => new Vector2(-1, -1));
        this.disappearingStarTimer = 0;
        this.starPos = new Vector3();
        this.computeInitialStarCount();
    }
    generateStarShadow(event) {
        const SCALE = 0.90;
        let gen = new ShapeGenerator();
        let x = 0.5 * SCALE;
        let y = -0.5 + 0.0015;
        let z = 0.25 * SCALE;
        gen.addTriangle(new Vector3(x, y, 0), new Vector3(0, y, -z), new Vector3(0, y, z));
        gen.addTriangle(new Vector3(-x, y, 0), new Vector3(0, y, -z), new Vector3(0, y, z), 1);
        this.meshStarShadow = gen.generateMesh(event);
    }
    createTerrainMesh(event) {
        const BOTTOM_HEIGHT = 0.5;
        let shapeGen = new ShapeGenerator();
        let height;
        let height2;
        for (let z = 0; z < this.depth; ++z) {
            for (let x = 0; x < this.width; ++x) {
                height = this.heightMap[(this.depth - 1 - z) * this.width + x];
                shapeGen.addHorizontalPlane(x, height, z, 1, 1, 1);
                if (height > 0) {
                    if (z > 0)
                        height2 = this.heightMap[(this.depth - 1 - (z - 1)) * this.width + x];
                    else
                        height2 = 0;
                    if (height2 < height) {
                        shapeGen.addVerticalPlaneXY(x, height, z, 1, -(height - height2));
                    }
                }
                if (height > 0) {
                    if (x < this.width - 1)
                        height2 = this.heightMap[(this.depth - 1 - z) * this.width + (x + 1)];
                    else
                        height2 = 0;
                    if (height2 < height) {
                        shapeGen.addVerticalPlaneYZ(x + 1, height, z, 1, -(height - height2));
                    }
                }
            }
        }
        shapeGen.addVerticalPlaneXY(0, -BOTTOM_HEIGHT, 0, this.width, BOTTOM_HEIGHT);
        shapeGen.addVerticalPlaneYZ(this.width, -BOTTOM_HEIGHT, 0, this.depth, BOTTOM_HEIGHT);
        this.meshTerrain = shapeGen.generateMesh(event);
    }
    modifyTiles() {
        const NEW_ARROW = [18, 17, 20, 19];
        let tid;
        let j;
        for (let i = 0; i < this.objectLayer.length; ++i) {
            tid = this.objectLayer[i];
            // TODO: Replace with switch
            if (this.eventType == SpecialEvent.ToggleWalls) {
                if (tid == 257) {
                    this.objectLayer[i] = 11;
                    // return;
                }
                else if (tid == 258) {
                    this.objectLayer[i] = 257;
                }
            }
            else if (this.eventType == SpecialEvent.RotateArrows) {
                if (tid == 259) {
                    this.objectLayer[i] = 14;
                    // return;
                }
                else if (tid == 260) {
                    this.objectLayer[i] = 259;
                }
                // Arrows
                else if (tid >= 17 && tid < 21) {
                    this.objectLayer[i] = NEW_ARROW[tid - 17];
                }
            }
            else if (this.eventType == SpecialEvent.IncreasingWall) {
                j = (this.depth - 1 - this.increasingWallPos.y) * this.width + this.increasingWallPos.x;
                if (this.objectLayer[j] == 16) {
                    this.objectLayer[j] = 261;
                    ++this.heightMap[j];
                }
            }
        }
    }
    update(event) {
        const STAR_ROTATE_SPEED = 0.05;
        const RING_SPEED = 1.0 / 60.0;
        this.starAngle = (this.starAngle + STAR_ROTATE_SPEED * event.step) % (Math.PI * 2);
        if (this.eventHappening) {
            if ((this.eventTimer -= event.step) <= 0) {
                this.eventHappening = false;
                this.eventTimer = 0;
                this.modifyTiles();
            }
        }
        this.arrowBlinkTimer = (this.arrowBlinkTimer + event.step) % (Stage.ARROW_BLINK_TIME);
        this.ringTimer = (this.ringTimer + RING_SPEED * event.step) % 1.0;
        if (this.disappearingStarTimer > 0) {
            this.disappearingStarTimer -= event.step;
        }
    }
    drawStar(canvas, x, y, z) {
        const REDUCE_BRIGHTNESS = 0.33;
        let angle = this.starAngle;
        if (x % 2 == z % 2)
            angle += Math.PI / 2;
        let t = 1.0;
        canvas.transform.push();
        canvas.transform.translate(x + 0.5, y + 0.5, z + 0.5);
        canvas.transform.rotate(angle, new Vector3(0, 1, 0));
        canvas.transform.use();
        canvas.setDrawColor(0, 0, 0, 0.33);
        canvas.drawMesh(this.meshStarShadow);
        if ((x | 0) == (this.specialShadowPos[0].x | 0) &&
            ((this.depth - 1 - z) | 0) == (this.specialShadowPos[0].y | 0)) {
            t = 1.0 - this.specialShadowValue * REDUCE_BRIGHTNESS;
        }
        canvas.setDrawColor(1 * t, 1 * t, 0.33 * t);
        canvas.drawMesh(this.meshStarShape);
        canvas.transform.pop();
        canvas.setDrawColor();
    }
    drawButton(canvas, x, y, z, pressed = false, type = 0) {
        const SCALE_Y = [0.33, 0.05];
        const BASE_SCALE = 0.80;
        const COLOR = [new Vector3(1.0, 0.33, 1.0), new Vector3(0.0, 1.0, 0.33)];
        const REDUCE_BRIGHTNESS = 0.33;
        let wallEvent = this.eventHappening &&
            ((type == 0 && this.eventType == SpecialEvent.ToggleWalls) ||
                (type == 1 && this.eventType == SpecialEvent.RotateArrows));
        let t = pressed ? 1.0 : 0.0;
        if (pressed && wallEvent) {
            t = this.eventTimer / Stage.EVENT_TIME;
        }
        let scale = SCALE_Y[0] * (1 - t) + SCALE_Y[1] * t;
        let mesh = [this.meshButton, this.meshButton2][type];
        canvas.transform.push();
        canvas.transform.translate(x + 0.5, y, z + 0.5);
        canvas.transform.scale(BASE_SCALE, scale, BASE_SCALE);
        canvas.transform.use();
        let colorBrightness = 1.0;
        for (let i = 0; i < 2; ++i) {
            if ((x | 0) == (this.specialShadowPos[i].x | 0) &&
                ((this.depth - 1 - z) | 0) == (this.specialShadowPos[i].y | 0)) {
                t = i == 0 ? this.specialShadowValue : 1.0 - this.specialShadowValue;
                colorBrightness = 1.0 - t * REDUCE_BRIGHTNESS;
                break;
            }
        }
        let color = Vector3.scalarMultiply(COLOR[type], colorBrightness);
        canvas.setDrawColor(color.x, color.y, color.z);
        canvas.drawMesh(mesh);
        canvas.transform.pop();
        canvas.setDrawColor();
    }
    drawSpecialWall(canvas, x, y, z, enabled = false) {
        const CROSS_SCALE = 0.85;
        let color1 = new Vector3(0.67, 0.33, 1.0);
        let color2 = new Vector3(1.0, 1.0, 1.0);
        let color3 = new Vector3(1, 1, 1);
        let color4 = new Vector3(0.67, 0.33, 1.0);
        let res;
        let t = 0.0;
        let wallEvent = this.eventHappening &&
            this.eventType == SpecialEvent.ToggleWalls;
        if (wallEvent) {
            t = this.eventTimer / Stage.EVENT_TIME;
            if (enabled)
                y -= t;
            else {
                y += 1.0;
                y -= (1.0 - t);
            }
        }
        canvas.transform.push();
        canvas.transform.translate(x + 0.5, y, z + 0.5);
        if (enabled || wallEvent) {
            canvas.transform.push();
            if (wallEvent) {
                if (enabled)
                    canvas.transform.scale(1, 1.0 - t, 1);
                else
                    canvas.transform.scale(1, t, 1);
            }
            if (!enabled)
                res = Vector3.lerp(color3, color4, t);
            else
                res = Vector3.lerp(color4, color3, t);
            canvas.transform.use();
            canvas.setDrawColor(res.x, res.y, res.z);
            canvas.drawMesh(this.meshSpecialWall);
            canvas.transform.pop();
        }
        canvas.transform.translate(0, 0.005, 0);
        canvas.transform.rotate(Math.PI / 4, new Vector3(0, 1, 0));
        canvas.transform.scale(CROSS_SCALE, 1, CROSS_SCALE);
        canvas.transform.use();
        if (!enabled)
            res = Vector3.lerp(color1, color2, t);
        else
            res = Vector3.lerp(color2, color1, t);
        canvas.setDrawColor(res.x, res.y, res.z);
        canvas.drawMesh(this.meshCross);
        canvas.transform.pop();
        canvas.setDrawColor();
    }
    drawIncreasingWall(canvas, x, y, z, up = false) {
        let t = 0.0;
        if (up)
            y -= 1.0;
        if (up || (this.eventHappening &&
            this.eventType == SpecialEvent.IncreasingWall &&
            this.increasingWallPos.x == x &&
            this.increasingWallPos.y == z)) {
            t = up ? 1.0 : 1.0 - this.eventTimer / Stage.EVENT_TIME;
            canvas.transform.push();
            canvas.transform.translate(x + 0.5, y + t, z + 0.5);
            canvas.transform.scale(1, t, 1);
            canvas.transform.use();
            canvas.setDrawColor(1.0, 0.67, 0);
            canvas.drawMesh(this.meshSpecialWall);
            canvas.transform.pop();
        }
        canvas.transform.push();
        canvas.transform.translate(x + 0.5, y + t + 0.005, z + 0.5);
        canvas.transform.use();
        canvas.setDrawColor(0.67, 0.0, 0);
        canvas.drawMesh(this.meshCircle);
        canvas.transform.pop();
    }
    drawArrows(canvas, x, y, z, index) {
        const BASE_ANGLE = [0, 2, 1, -1];
        const COLORS = [new Vector3(0, 0.67, 0.33), new Vector3(0.33, 1, 0.67)];
        let angle = BASE_ANGLE[index] * Math.PI / 2;
        let color;
        let t = (this.arrowBlinkTimer % (Stage.ARROW_BLINK_TIME / 2)) / (Stage.ARROW_BLINK_TIME / 2);
        if (this.arrowBlinkTimer >= Stage.ARROW_BLINK_TIME / 2)
            t = 1.0 - t;
        let wallEvent = this.eventHappening &&
            this.eventType == SpecialEvent.RotateArrows;
        if (wallEvent) {
            angle += Math.PI * (1.0 - this.eventTimer / Stage.EVENT_TIME);
        }
        canvas.transform.push();
        canvas.transform.translate(x + 0.5, y + 0.001, z + 0.5);
        canvas.transform.rotate(angle, new Vector3(0, 1, 0));
        for (let i = 0; i < 2; ++i) {
            if (i == 0)
                color = Vector3.lerp(COLORS[0], COLORS[1], t);
            else
                color = Vector3.lerp(COLORS[1], COLORS[0], t);
            canvas.transform.translate(0, 0, i == 1 ? 0.45 : -0.20);
            canvas.transform.use();
            canvas.setDrawColor(color.x, color.y, color.z);
            canvas.drawMesh(this.meshArrow);
        }
        canvas.transform.pop();
    }
    drawTeleportationRings(canvas, x, y, z) {
        const RING_COUNT = 4;
        const BASE_COLOR = new Vector3(0, 0.33, 1.0);
        let offset = 1.0 / (RING_COUNT + 1);
        let dy = this.ringTimer * offset;
        let alpha;
        canvas.transform.push();
        canvas.transform.translate(x + 0.5, y + 0.001 + dy, z + 0.5);
        for (let i = 0; i < RING_COUNT; ++i) {
            alpha = 1.0;
            if (i == 0) {
                alpha = this.ringTimer;
            }
            else if (i == RING_COUNT - 1) {
                alpha = 1.0 - this.ringTimer;
            }
            canvas.setDrawColor(BASE_COLOR.x, BASE_COLOR.y, BASE_COLOR.z, alpha);
            if (i > 0)
                canvas.transform.translate(0, offset, 0);
            canvas.transform.use();
            canvas.drawMesh(this.meshRing);
        }
        canvas.transform.pop();
    }
    drawStaticObjects(canvas) {
        let tid;
        let y;
        let dz;
        for (let z = 0; z < this.depth; ++z) {
            for (let x = 0; x < this.width; ++x) {
                tid = this.objectLayer[z * this.width + x];
                if (tid == 0)
                    continue;
                y = this.getHeight(x, z);
                dz = this.depth - 1 - z;
                switch (tid) {
                    // Star
                    case 10:
                        this.drawStar(canvas, x, y, dz);
                        break;
                    // Button (purple)
                    case 11:
                    case 257:
                        this.drawButton(canvas, x, y, dz, tid == 257, 0);
                        break;
                    // Button (green)
                    case 14:
                    case 259:
                        this.drawButton(canvas, x, y, dz, tid == 259, 1);
                        break;
                    // Special wall
                    case 12:
                    case 13:
                        this.drawSpecialWall(canvas, x, y, dz, tid == 13);
                        break;
                    // Teleportation
                    case 15:
                        this.drawTeleportationRings(canvas, x, y, dz);
                        break;
                    // Increasing wall
                    case 16:
                    case 261:
                        this.drawIncreasingWall(canvas, x, y, dz, tid == 261);
                        break;
                    // Arrows
                    case 17:
                    case 18:
                    case 19:
                    case 20:
                        this.drawArrows(canvas, x, y, dz, tid - 17);
                        break;
                    default:
                        break;
                }
            }
        }
    }
    setCamera(canvas) {
        canvas.transform.translate(0, 0, -this.depth);
    }
    draw(canvas) {
        canvas.transform.push();
        this.setCamera(canvas);
        canvas.transform.use();
        canvas.setDrawColor();
        canvas.drawMesh(this.meshTerrain);
        this.drawStaticObjects(canvas);
        canvas.transform.pop();
    }
    postDraw(canvas) {
        const SCALE_FACTOR = 3.0;
        if (this.disappearingStarTimer <= 0)
            return;
        let t = 1.0 - this.disappearingStarTimer / Stage.STAR_TIME;
        let scale = 1.0 + (SCALE_FACTOR - 1.0) * t;
        canvas.clearDepth();
        canvas.transform.push();
        this.setCamera(canvas);
        canvas.transform.translate(this.starPos.x + 0.5, this.starPos.y + 0.5, this.starPos.z + 0.5);
        canvas.transform.rotate(-Math.PI / 4, new Vector3(0, 1, 0));
        canvas.transform.rotate(Math.PI / 4, new Vector3(1, 0, 0));
        canvas.transform.scale(scale, scale, scale);
        canvas.transform.use();
        canvas.setDrawColor(1, 1, 0.33, 1.0 - t);
        canvas.drawMesh(this.meshStarShape);
        canvas.transform.pop();
        canvas.setDrawColor();
    }
    parseObjectLayer(objects, event) {
        let tid;
        for (let z = 0; z < this.depth; ++z) {
            for (let x = 0; x < this.width; ++x) {
                tid = this.baseMap.getTile(1, x, z);
                if (tid == 0)
                    continue;
                switch (tid) {
                    case 9:
                        objects.createPlayer(x, this.heightMap[z * this.width + x], z, event);
                        break;
                    default:
                        break;
                }
            }
        }
    }
    getHeight(x, z, offStageValue = 256) {
        if (x < 0 || z < 0 || x >= this.width || z >= this.depth)
            return offStageValue;
        return this.heightMap[z * this.width + x];
    }
    toggleWalls() {
        for (let i = 0; i < this.objectLayer.length; ++i) {
            if (this.objectLayer[i] == 12) {
                ++this.heightMap[i];
                this.objectLayer[i] = 13;
            }
            else if (this.objectLayer[i] == 13) {
                --this.heightMap[i];
                this.objectLayer[i] = 12;
            }
        }
    }
    startEvent(type) {
        this.eventType = type;
        this.eventTimer = Stage.EVENT_TIME;
        this.eventHappening = true;
    }
    checkTile(x, y, z, consumeStars = true) {
        let index = z * this.width + x;
        if (this.getHeight(x, z) == y) {
            switch (this.objectLayer[index]) {
                // Star
                case 10:
                    if (consumeStars) {
                        --this.totalStars;
                        this.disappearingStarTimer = Stage.STAR_TIME;
                        this.starPos = new Vector3(x, y, this.depth - 1 - z);
                        this.objectLayer[index] = 0;
                        return TileEffect.StarObtained;
                    }
                    break;
                // Button (purple)
                case 11:
                    this.toggleWalls();
                    this.objectLayer[index] = 258;
                    this.startEvent(SpecialEvent.ToggleWalls);
                    return TileEffect.ButtonPressed;
                // Button (green)
                case 14:
                    this.objectLayer[index] = 260;
                    this.startEvent(SpecialEvent.RotateArrows);
                    return TileEffect.ButtonPressed;
                // Teleporter
                case 15:
                    return TileEffect.Teleportation;
                // Increasing wall
                case 16:
                    this.increasingWallPos = new Vector2(x, this.depth - 1 - z);
                    this.startEvent(SpecialEvent.IncreasingWall);
                    return TileEffect.IncreasingWall;
                default:
                    break;
            }
        }
        return TileEffect.None;
    }
    checkAutomaticArrows(x, y, z) {
        const DIR_X = [0, 0, 1, -1];
        const DIR_Z = [-1, 1, 0, 0];
        if (y != this.getHeight(x, z))
            return null;
        let tid = this.objectLayer[z * this.width + x];
        if (tid >= 17 && tid < 21) {
            return new Vector2(DIR_X[tid - 17], DIR_Z[tid - 17]);
        }
        return null;
    }
    setSpecialShadow(x1, z1, x2, z2, amount) {
        this.specialShadowPos[0].x = x1;
        this.specialShadowPos[0].y = z1;
        this.specialShadowPos[1].x = x2;
        this.specialShadowPos[1].y = z2;
        this.specialShadowValue = amount;
    }
    findTeleporter(dx, dz) {
        for (let z = 0; z < this.depth; ++z) {
            for (let x = 0; x < this.width; ++x) {
                if ((x != dx || z != dz) &&
                    this.objectLayer[z * this.width + x] == 15) {
                    return new Vector3(x, this.getHeight(x, z), z);
                }
            }
        }
        return new Vector3(dx, this.getHeight(dx, dz), dz);
    }
}
Stage.EVENT_TIME = 30;
Stage.ARROW_BLINK_TIME = 60;
Stage.STAR_TIME = 30;
