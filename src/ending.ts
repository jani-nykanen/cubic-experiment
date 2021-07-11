import { Canvas, ShaderType } from "./core/canvas.js";
import { CoreEvent, Scene } from "./core/core.js";
import { TransitionEffectType } from "./core/transition.js";
import { RGBA } from "./core/vector.js";
import { TitleScreen } from "./titlescreen.js";


export class Ending implements Scene {


    constructor(param : any, event : CoreEvent) {

    }


    public update(event : CoreEvent) {

        if (event.transition.isActive()) return;

        if (event.input.anyPressed()) {

            event.transition.activate(true, TransitionEffectType.Fade,
                1.0/60.0, event => {
                    event.changeScene(TitleScreen);
                    event.audio.resumeMusic();
                },
                new RGBA(0.33, 0.67, 1.0));
        }
    }


    public redraw(canvas : Canvas) {

        const SCALE = 0.667;

        canvas.changeShader(ShaderType.Textured);
        canvas.toggleDepthTest(false);

        canvas.clear(0.33, 0.67, 1.0);
        canvas.resetVertexAndFragmentTransforms();

        canvas.transform.loadIdentity();
        canvas.transform.fitGivenDimension(720.0, canvas.width/canvas.height);
        canvas.transform.use();

        let view = canvas.transform.getViewport();
        canvas.setDrawColor();

        let bmp = canvas.getBitmap("end");
        canvas.drawBitmap(bmp, 
            view.x/2 - bmp.width/2*SCALE, 
            view.y/2 - bmp.height/2*SCALE,
            bmp.width*SCALE, 
            bmp.height*SCALE);
    }


    public dispose = (event : CoreEvent) : any => null;

}
