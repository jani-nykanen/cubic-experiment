import { Canvas, ShaderType } from "./core/canvas.js";
import { CoreEvent, Scene } from "./core/core.js";


export class Ending implements Scene {


    constructor(param : any, event : CoreEvent) {

    }


    public update(event : CoreEvent) {

        if (event.transition.isActive()) return;
    }


    public redraw(canvas : Canvas) {

        canvas.changeShader(ShaderType.Textured);
        canvas.toggleDepthTest(false);

        canvas.clear(0.33, 0.67, 1.0);
        canvas.resetVertexAndFragmentTransforms();

        canvas.transform.loadIdentity();
        canvas.transform.fitGivenDimension(720.0, canvas.width/canvas.height);
        canvas.transform.use();

        let view = canvas.transform.getViewport();
        canvas.setDrawColor();
        canvas.drawTextWithShadow(canvas.getBitmap("font"), "THE END",
            view.x/2, view.y/2-16, -28, 0, true, 0.5, 0.5, 4, 4, 0.33);
    }


    public dispose = (event : CoreEvent) : any => null;

}
