/// The following defines a bunch of commonly used shader formats.

// The default fragment shader. Applies a single color which is supplied via a uniform vec3.
var colorFragment = `
precision highp float;
uniform vec3 color;
void main() {
    vec2 xy = gl_FragCoord.xy;
    gl_FragColor = vec4(color,1.0);
}
`;
var colorFragmentChecker = `
precision highp float;
uniform vec3 color;
varying vec3 norm;
varying vec3 coord;
vec3 dir = vec3(0.3,1,0.3);




void main() {
    vec3 color = vec3(0,0.5,1.0);
    float light_intensity = abs(dot(norm,dir));
    vec2 xy = gl_FragCoord.xy;
    gl_FragColor = vec4(light_intensity*color,1.0);
}
`;

// The defualt vertex shader. Recieves world-data regarding position, rotation, scale. 
// Note: If initialized with the shader function, world-data is set to the correspodning identity matrices. Thus, a user may display an object 'easily'.
var defaultVertex = `
precision mediump float; 
attribute vec3 coordinates;

uniform mat2 world;
uniform vec2 pos;
uniform mat2 rot;
uniform mat2 scale;


void main() {
    //mat4 adjusted = projection*view*model;
    vec2 position = (((coordinates.xy*scale)*rot)+pos)+0.0*vec2(1,1)*world;
    gl_Position = vec4(position,coordinates.z, 1.0);
}
`;

var defaultVertex3D = `
precision mediump float; 
attribute vec3 coordinates;
attribute vec3 normals;

uniform mat2 world;
uniform vec2 pos;
uniform mat2 rot;
uniform mat2 scale;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
varying vec3 coord;
varying vec3 norm;


void main() {
    vec4 adjusted = (projection*view*model*vec4(coordinates, 1.0));
    gl_Position = projection*view*model*vec4(coordinates, 1.0);
    norm = normals;
    coord = coordinates.xyz;

}
`;


var default_shader_vert3 = `
precision mediump float; 
attribute vec3 coordinates;
attribute vec3 offset;

uniform mat2 world;
uniform vec2 pos;
uniform mat2 rot;
uniform mat2 scale;
//projection*view*model*



void main() {
    //vec2 new_pos = (((coordinates.xy*scale)*rot)+pos)+vec2(1,1)*world;
    gl_Position = vec4(coordinates, 1.0);
}
`;


// Vertex shader with texture info supplied.
var textureVertex = `
precision mediump float; 
attribute vec3 coordinates;
attribute vec2 a_texcoord;
varying vec2 v_texcoord;




void main() {
    gl_Position = vec4(coordinates, 1.0);
    v_texcoord = a_texcoord;
}
`;
// Fragment shader rendering from a supplied texture.
var textureFragment = `
precision highp float;
uniform vec2 res;
uniform vec3 color;
varying vec2 v_texcoord;
uniform sampler2D u_texture;


void main() {
    vec2 xy = gl_FragCoord.xy;
    gl_FragColor = vec4(texture2D(u_texture,v_texcoord));
}
`;

