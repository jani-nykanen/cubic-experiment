import { ShaderType } from "./core/canvas.js";
import { Menu, MenuButton } from "./menu.js";
import { StartIntro } from "./startintro.js";
const TEXT = `
Would you like to enable audio?
You can change this later in the
settings.

Press Enter to confirm.
`;
export class AudioIntro {
    constructor(param, event) {
        this.dispose = (event) => 0;
        this.yesNoMenu = new Menu([
            new MenuButton("Yes", event => {
                event.audio.setGlobalMusicVolume(AudioIntro.INITIAL_MUSIC_VOLUME);
                event.audio.setGlobalSampleVolume(AudioIntro.INITIAL_SAMPLE_VOLUME);
                event.changeScene(StartIntro);
            }),
            new MenuButton("No", event => {
                event.audio.setGlobalMusicVolume(0);
                event.audio.setGlobalSampleVolume(0);
                event.changeScene(StartIntro);
            })
        ]);
        this.yesNoMenu.activate(0);
        this.width = Math.max(...TEXT.split('\n').map(s => s.length));
    }
    update(event) {
        this.yesNoMenu.update(event);
    }
    redraw(canvas) {
        const OFFSET = -28;
        const SCALE = 0.5;
        canvas.changeShader(ShaderType.Textured);
        canvas.toggleDepthTest(false);
        canvas.clear(0.33, 0.67, 1.0);
        canvas.resetVertexAndFragmentTransforms();
        canvas.transform.loadIdentity();
        canvas.transform.fitGivenDimension(720.0, canvas.width / canvas.height);
        canvas.transform.use();
        let x = canvas.transform.getViewport().x / 2 -
            (this.width * (64 + OFFSET) * SCALE) / 2;
        canvas.drawTextWithShadow(canvas.getBitmap("font"), TEXT, x, 128, OFFSET, 0, false, SCALE, SCALE, 4, 4, 0.33);
        canvas.transform.translate(0, 128, 0);
        canvas.transform.use();
        this.yesNoMenu.draw(canvas, 0.5, false, 0.0);
    }
}
AudioIntro.INITIAL_SAMPLE_VOLUME = 0.50;
AudioIntro.INITIAL_MUSIC_VOLUME = 0.60;
