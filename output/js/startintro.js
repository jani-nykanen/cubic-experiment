import { ShaderType } from "./core/canvas.js";
import { TransitionEffectType } from "./core/transition.js";
import { RGBA } from "./core/vector.js";
import { TitleScreen } from "./titlescreen.js";
export class StartIntro {
    constructor(param, event) {
        this.dispose = (event) => 0;
        this.waitTimer = 120.0;
        event.transition.activate(false, TransitionEffectType.Fade, 1.0 / 30.0, null, new RGBA(0.33, 0.67, 1));
    }
    update(event) {
        if (event.transition.isActive())
            return;
        if ((this.waitTimer -= event.step) <= 0 ||
            event.input.anyPressed()) {
            event.transition.activate(true, TransitionEffectType.Fade, 1.0 / 30.0, event => event.changeScene(TitleScreen), new RGBA(0.33, 0.67, 1.0));
        }
    }
    redraw(canvas) {
        const SCALE = 0.5;
        canvas.changeShader(ShaderType.Textured);
        canvas.toggleDepthTest(false);
        canvas.clear(0.33, 0.67, 1.0);
        canvas.resetVertexAndFragmentTransforms();
        canvas.transform.loadIdentity();
        canvas.transform.fitGivenDimension(720.0, canvas.width / canvas.height);
        canvas.transform.use();
        let view = canvas.transform.getViewport();
        canvas.setDrawColor();
        let bmp = canvas.getBitmap("createdby");
        canvas.drawBitmap(bmp, view.x / 2 - bmp.width / 2 * SCALE, view.y / 2 - bmp.height / 2 * SCALE, bmp.width * SCALE, bmp.height * SCALE);
    }
}
