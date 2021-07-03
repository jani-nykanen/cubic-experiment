import { Canvas, ShaderType } from "./core/canvas.js";
import { CoreEvent, Scene } from "./core/core.js";
import { GameScene } from "./game.js";
import { Menu, MenuButton } from "./menu.js";


export class TitleScreen implements Scene {


    private options : Menu;


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
        canvas.drawText(canvas.getBitmap("font"), "This is the title screen",
            view.x/2, view.y/2-16, -28, 0, true, 0.5, 0.5);
    }


    public dispose = (event : CoreEvent) : any => null;

}
