import { clamp } from "./mathext.js";
import { AudioSample } from "./sample.js";

 
export class AudioPlayer {


    private ctx : AudioContext;
    private musicTrack : AudioSample;

    private globalSampleVol : number;
    private globalMusicVol : number;
    private enabled : boolean;


    constructor() {

        this.ctx = new AudioContext();

        this.musicTrack = null;

        this.globalSampleVol = 1.0;
        this.globalMusicVol = 1.0;

        this.enabled = false;
    }


    public playSample(sample : AudioSample, vol = 1.0) {

        const EPS = 0.001;

        if (!this.enabled || this.globalSampleVol <= EPS) return;

        sample.play(this.ctx, 
            this.globalSampleVol*vol, false, 0);
    }


    public playMusic(sample : AudioSample, vol = 1.0) {

        this.fadeInMusic(sample, vol, null);
    }


    public fadeInMusic(sample : AudioSample, vol = 1.0, fadeTime = 0.0) {

        const EPS = 0.001;

        if (!this.enabled) return;

        if (this.globalMusicVol <= EPS) {

            this.musicTrack = sample;
            return;
        }

        if (this.musicTrack != null) {

            this.musicTrack.stop();
            this.musicTrack = null;
        }

        let v = this.globalMusicVol*vol;
        sample.fadeIn(this.ctx, fadeTime == null ? v : 0.01, v, true, 0, fadeTime);
        this.musicTrack = sample;
    }


    public toggle(state : boolean) {

        this.enabled = state;
    }


    public setGlobalSampleVolume(vol = 1.0) {

        this.globalSampleVol = clamp(vol, 0, 1);
    }


    public setGlobalMusicVolume(vol = 1.0) {

        const EPS = 0.001;

        let oldVol = this.globalMusicVol;

        this.globalMusicVol = clamp(vol, 0, 1);

        if (vol < EPS) {

            this.pauseMusic();
            return;
        }
        else if (oldVol < EPS && this.musicTrack != null) {

            this.playMusic(this.musicTrack, 1.0);
            return;
        }

        //
        // TODO: This is a bit broken and only works if the music 
        // volume (of the track) is 1.0
        //
        if (this.musicTrack != null) {
            
            this.musicTrack.changeVolume(this.ctx, this.globalMusicVol);
        }
    }


    public pauseMusic() {

        if (!this.enabled || this.musicTrack == null)
            return;

        this.musicTrack.pause(this.ctx);
    }


    public resumeMusic() {

        if (!this.enabled || this.musicTrack == null)
            return;

        this.musicTrack.resume(this.ctx);
    }


    public stopMusic() {

        if (!this.enabled || this.musicTrack == null)
            return;

        this.musicTrack.stop();
        this.musicTrack = null;
    }


    public getContext = () : AudioContext => this.ctx;

    public getGlobalSampleVolume = () : number => this.globalSampleVol;
    public getGlobalMusicVolume = () : number => this.globalMusicVol;
}