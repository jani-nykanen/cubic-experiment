import { ShaderType } from "./core/canvas.js";
export class TitleScreen {
    constructor(param, event) {
        this.dispose = (event) => null;
    }
    update(event) {
        if (event.transition.isActive())
            return;
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
        canvas.drawText(canvas.getBitmap("font"), "This is the title screen", view.x / 2, view.y / 2 - 16, -28, 0, true, 0.5, 0.5);
    }
}
