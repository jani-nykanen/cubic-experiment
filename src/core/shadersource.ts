

export const VertexSource = {

Textured : 
    
`
attribute vec3 vertexPos;
attribute vec2 vertexUV;
attribute vec3 vertexNormal;

uniform mat4 transform;
uniform mat4 rotation;

uniform vec3 pos;
uniform vec3 size;

uniform vec3 lightDir;
uniform float lightMag;

varying vec2 uv;
varying float light;


void main() {

    gl_Position = transform * vec4(vertexPos * size + pos, 1);
    uv = vertexUV;

    vec3 rot = (rotation * vec4(vertexNormal,1)).xyz;
    light = clamp(lightMag * (1.0 + dot(rot, lightDir)), 0.0, 1.0);
}`,

NoTexture : 
    
`
attribute vec3 vertexPos;
attribute vec2 vertexUV;
attribute vec3 vertexNormal;

uniform mat4 transform;
uniform mat4 rotation;

uniform vec3 pos;
uniform vec3 size;

uniform vec3 lightDir;
uniform float lightMag;

varying float light;


void main() {

    gl_Position = transform * vec4(vertexPos * size + pos, 1);

    vec3 rot = (rotation * vec4(vertexNormal,1)).xyz;
    light = clamp(lightMag * (1.0 + dot(rot, lightDir)), 0.0, 1.0);
}`,
}


export const FragmentSource = {

Textured : 

`
precision mediump float;
     
uniform sampler2D texSampler;

uniform vec4 color;

uniform vec2 texPos;
uniform vec2 texSize;

varying vec2 uv;
varying float light;

void main() {

    vec2 tex = uv * texSize + texPos;    
    vec4 res = texture2D(texSampler, tex) * color;

    if(res.a <= 0.01) {
         discard;
    }

    gl_FragColor = res;
}`,


NoTexture : 

`
precision mediump float;

uniform vec4 color;

uniform sampler2D texSampler;

varying float light;

void main() {

    gl_FragColor = color;
}`,


NoTextureLight : 

`
precision mediump float;

uniform vec4 color;

uniform sampler2D texSampler;

varying float light;

void main() {

    gl_FragColor = vec4((1.0 - light) * color.rgb, color.a);
}`,


TexturedLight : 

`
precision mediump float;
     
uniform sampler2D texSampler;

uniform vec4 color;

uniform vec2 texPos;
uniform vec2 texSize;

varying vec2 uv;
varying float light;

void main() {

    vec2 tex = uv * texSize + texPos;    
    vec4 res = texture2D(texSampler, tex) * color;

    if(res.a <= 0.01) {
         discard;
    }

    gl_FragColor =  vec4((1.0 - light) * res.rgb, res.a);
}`,



TexturedFog :

`precision mediump float;
 
uniform sampler2D texSampler;

uniform vec4 color;

uniform vec4 fogColor;
uniform float fogDensity;

uniform vec2 texPos;
uniform vec2 texSize;

varying vec2 uv;
varying float light;

void main() {
 
    vec2 tex = uv * texSize + texPos;    
    vec4 res = color * texture2D(texSampler, tex);
    
    if(res.a <= 0.01) {
        discard;
    }
    vec4 a = gl_FragCoord;

    float z = a.z / a.w;
    float d = z * fogDensity;
    float fog = 1.0 / exp(d*d);
    fog = clamp(fog, 0.0, 1.0);
    gl_FragColor = vec4(fog*res.xyz + (1.0-fog)*fogColor.xyz, res.a);

}`,

}
