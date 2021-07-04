import { ShaderType } from "./core/canvas.js";
import { TransitionEffectType } from "./core/transition.js";
import { RGBA } from "./core/vector.js";
import { GameScene } from "./game.js";
export class Intro {
    constructor(param, event) {
        this.dispose = (event) => 0;
        this.waitTimer = 120.0;
    }
    update(event) {
        if (event.transition.isActive())
            return;
        if ((this.waitTimer -= event.step) <= 0) {
            event.transition.activate(true, TransitionEffectType.Fade, 1.0 / 30.0, event => event.changeScene(GameScene), new RGBA(0.33, 0.67, 1.0));
        }
    }
    redraw(canvas) {
        canvas.changeShader(ShaderType.Textured);
        canvas.toggleDepthTest(false);
        canvas.clear(0.33, 0.67, 1.0);
        canvas.resetVertexAndFragmentTransforms();
        canvas.transform.loadIdentity();
        canvas.transform.fitGivenDimension(720.0, canvas.width / canvas.height);
        canvas.transform.use();
        let view = canvas.transform.getViewport();
        canvas.setDrawColor();
        canvas.drawTextWithShadow(canvas.getBitmap("font"), "Reach for the stars!", view.x / 2, view.y / 2 - 16, -28, 0, true, 0.5, 0.5, 4, 4, 0.33);
    }
}
