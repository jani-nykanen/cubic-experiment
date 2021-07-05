import { AssetManager } from "./assets.js";
import { AudioPlayer } from "./audioplayer.js";
import { Canvas, ShaderType } from "./canvas.js";
import { InputManager } from "./input.js";
import { TransitionEffectManager } from "./transition.js";
export class CoreEvent {
    constructor(step, core, input, assets, canvas, transition, audio) {
        this.constructMesh = (vertices, textureCoordinates, normals, indices) => this.canvas.constructMesh(vertices, textureCoordinates, normals, indices);
        this.disposeMesh = (mesh) => this.canvas.destroyMesh(mesh);
        this.getSample = (name) => this.assets.getSample(name);
        this.getControlMode = () => this.controlMode;
        this.core = core;
        this.step = step;
        this.input = input;
        this.assets = assets;
        this.transition = transition;
        this.audio = audio;
        this.canvas = canvas;
        this.controlMode = 0;
    }
    changeScene(newScene) {
        this.core.changeScene(newScene);
    }
    changeControlMode(newMode) {
        this.controlMode = newMode;
    }
}
export class Core {
    constructor(canvasWidth = -1, canvasHeight = -1, frameSkip = 0) {
        this.audio = new AudioPlayer();
        this.assets = new AssetManager(this.audio);
        this.canvas = new Canvas(canvasWidth, canvasHeight, this.assets);
        this.assets.passCanvas(this.canvas);
        this.input = new InputManager();
        this.input.addAction("left", "ArrowLeft", 14)
            .addAction("up", "ArrowUp", 12)
            .addAction("right", "ArrowRight", 15)
            .addAction("down", "ArrowDown", 13),
            this.transition = new TransitionEffectManager();
        this.event = new CoreEvent(frameSkip + 1, this, this.input, this.assets, this.canvas, this.transition, this.audio);
        this.timeSum = 0.0;
        this.oldTime = 0.0;
        this.initialized = false;
        this.activeScene = null;
        this.activeSceneType = null;
    }
    drawLoadingScreen(canvas) {
        const BAR_BORDER_WIDTH = 1;
        const TARGET_HEIGHT = 240.0;
        let barWidth = TARGET_HEIGHT * (canvas.width / canvas.height) / 4;
        let barHeight = barWidth / 8;
        canvas.clear(0, 0, 0);
        canvas.changeShader(ShaderType.NoTextures);
        canvas.toggleDepthTest(false);
        canvas.transform.loadIdentity();
        canvas.transform.fitHeight(TARGET_HEIGHT, canvas.width / canvas.height);
        canvas.transform.use();
        let t = this.assets.dataLoadedUnit();
        let x = canvas.transform.getViewport().x / 2 - barWidth / 2;
        let y = canvas.transform.getViewport().y / 2 - barHeight / 2;
        x |= 0;
        y |= 0;
        // Outlines
        canvas.setDrawColor();
        canvas.drawRectangle(x - BAR_BORDER_WIDTH * 2, y - BAR_BORDER_WIDTH * 2, barWidth + BAR_BORDER_WIDTH * 4, barHeight + BAR_BORDER_WIDTH * 4);
        canvas.setDrawColor(0, 0, 0);
        canvas.drawRectangle(x - BAR_BORDER_WIDTH, y - BAR_BORDER_WIDTH, barWidth + BAR_BORDER_WIDTH * 2, barHeight + BAR_BORDER_WIDTH * 2);
        // Bar
        let w = (barWidth * t) | 0;
        canvas.setDrawColor();
        canvas.drawRectangle(x, y, w, barHeight);
    }
    loop(ts, onLoad) {
        const MAX_REFRESH_COUNT = 5;
        const FRAME_WAIT = 16.66667 * this.event.step;
        this.timeSum += ts - this.oldTime;
        this.timeSum = Math.min(MAX_REFRESH_COUNT * FRAME_WAIT, this.timeSum);
        this.oldTime = ts;
        let refreshCount = (this.timeSum / FRAME_WAIT) | 0;
        while ((refreshCount--) > 0) {
            if (!this.initialized && this.assets.hasLoaded()) {
                onLoad(this.event);
                if (this.activeSceneType != null)
                    this.activeScene = new this.activeSceneType.prototype.constructor(null, this.event);
                this.initialized = true;
            }
            this.input.preUpdate();
            if (this.initialized && this.activeScene != null) {
                this.activeScene.update(this.event);
            }
            this.transition.update(this.event);
            this.input.postUpdate();
            this.timeSum -= FRAME_WAIT;
        }
        if (this.initialized) {
            if (this.activeScene != null)
                this.activeScene.redraw(this.canvas);
            this.transition.draw(this.canvas);
        }
        else {
            this.drawLoadingScreen(this.canvas);
        }
        window.requestAnimationFrame(ts => this.loop(ts, onLoad));
    }
    addInputAction(name, key, button1 = -1, button2 = -1) {
        this.input.addAction(name, key, button1, button2);
        return this;
    }
    loadAssets(indexFilePath) {
        this.assets.parseAssetIndexFile(indexFilePath);
        return this;
    }
    run(initialScene, onLoad = () => { }) {
        this.activeSceneType = initialScene;
        this.loop(0, onLoad);
    }
    changeScene(newScene) {
        let param = this.activeScene.dispose(this.event);
        this.activeScene = new newScene.prototype.constructor(param, this.event);
    }
}
