import { OBJModel } from "./objloader.js";
import { AudioSample } from "./sample.js";
import { Tilemap } from "./tilemap.js";
import { KeyValuePair } from "./types.js";
export class AssetContainer {
    constructor() {
        this.assets = new Array();
    }
    getAsset(name) {
        for (let a of this.assets) {
            if (a.key == name)
                return a.value;
        }
        return null;
    }
    addAsset(name, data) {
        this.assets.push(new KeyValuePair(name, data));
    }
}
export class AssetManager {
    constructor(audio) {
        this.bitmaps = new AssetContainer();
        this.samples = new AssetContainer();
        this.tilemaps = new AssetContainer();
        this.documents = new AssetContainer();
        this.models = new AssetContainer();
        this.total = 0;
        this.loaded = 0;
        this.audio = audio;
    }
    loadTextfile(path, type, cb) {
        let xobj = new XMLHttpRequest();
        xobj.overrideMimeType("text/" + type);
        xobj.open("GET", path, true);
        ++this.total;
        xobj.onreadystatechange = () => {
            if (xobj.readyState == 4) {
                if (String(xobj.status) == "200") {
                    if (cb != undefined)
                        cb(xobj.responseText);
                }
                ++this.loaded;
            }
        };
        xobj.send(null);
    }
    passCanvas(canvas) {
        this.canvas = canvas;
    }
    loadBitmap(name, url, repeatFlag = 0) {
        ++this.total;
        let image = new Image();
        image.onload = () => {
            ++this.loaded;
            this.bitmaps.addAsset(name, this.canvas.createBitmap(image, repeatFlag));
        };
        image.src = url;
    }
    loadSample(name, path) {
        ++this.total;
        let xobj = new XMLHttpRequest();
        xobj.open("GET", path, true);
        xobj.responseType = "arraybuffer";
        xobj.onload = () => {
            this.audio.getContext().decodeAudioData(xobj.response, (data) => {
                ++this.loaded;
                this.samples.addAsset(name, new AudioSample(this.audio.getContext(), data));
            });
        };
        xobj.send(null);
    }
    loadTilemap(name, url) {
        ++this.total;
        this.loadTextfile(url, "xml", (str) => {
            this.tilemaps.addAsset(name, new Tilemap(str));
            ++this.loaded;
        });
    }
    loadDocument(name, url) {
        ++this.total;
        this.loadTextfile(url, "xml", (str) => {
            this.documents.addAsset(name, str);
            ++this.loaded;
        });
    }
    loadModel(name, url) {
        ++this.total;
        OBJModel.load(url, o => {
            ++this.loaded;
            this.models.addAsset(name, this.canvas.createModel(o));
        });
    }
    parseAssetIndexFile(url) {
        this.loadTextfile(url, "json", (s) => {
            let data = JSON.parse(s);
            let path;
            if (data["bitmapPath"] != undefined &&
                data["bitmaps"] != undefined) {
                path = data["bitmapPath"];
                for (let o of data["bitmaps"]) {
                    this.loadBitmap(o["name"], path + o["path"], Number(o["repeat"]));
                }
            }
            if (data["samplePath"] != undefined &&
                data["samples"] != undefined) {
                path = data["samplePath"];
                for (let o of data["samples"]) {
                    this.loadSample(o["name"], path + o["path"]);
                }
            }
            if (data["tilemapPath"] != undefined &&
                data["tilemaps"] != undefined) {
                path = data["tilemapPath"];
                for (let o of data["tilemaps"]) {
                    this.loadTilemap(o["name"], path + o["path"]);
                }
            }
            if (data["documentPath"] != undefined &&
                data["documents"] != undefined) {
                path = data["documentPath"];
                for (let o of data["documents"]) {
                    this.loadDocument(o["name"], path + o["path"]);
                }
            }
            if (data["modelPath"] != undefined &&
                data["models"] != undefined) {
                path = data["modelPath"];
                for (let o of data["models"]) {
                    this.loadModel(o["name"], path + o["path"]);
                }
            }
        });
    }
    hasLoaded() {
        return this.loaded >= this.total;
    }
    getBitmap(name) {
        return this.bitmaps.getAsset(name);
    }
    getSample(name) {
        return this.samples.getAsset(name);
    }
    getTilemap(name) {
        return this.tilemaps.getAsset(name);
    }
    getDocument(name) {
        return this.documents.getAsset(name);
    }
    getModel(name) {
        return this.models.getAsset(name);
    }
    dataLoadedUnit() {
        return this.total == 0 ? 1.0 : this.loaded / this.total;
    }
}
