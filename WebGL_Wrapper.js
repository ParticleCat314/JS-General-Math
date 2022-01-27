var default_shader_frag = `
precision highp float;
uniform vec2 res;
uniform vec3 color;
void main() {
    vec2 xy = gl_FragCoord.xy;
    gl_FragColor = vec4(color,1.0);
}
`;

var default_shader_vert = `
precision mediump float; 
attribute vec3 coordinates;
attribute vec3 offset;

uniform mat2 world;
uniform vec2 pos;
uniform mat2 rot;
uniform mat2 scale;
//projection*view*model*



void main() {
    vec2 new_pos = (((coordinates.xy*scale)*rot)+pos)+vec2(1,1)*world;
    gl_Position = vec4(new_pos,coordinates.z, 1.0);
}
`;

var primative = {
    cube_positions: [
        // Front face
        -1.0, -1.0,  1.0,
        1.0, -1.0,  1.0,
        1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0, -1.0, -1.0,
        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
        1.0,  1.0,  1.0,
        1.0,  1.0, -1.0,
        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,
        // Right face
        1.0, -1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0,  1.0,  1.0,
        1.0, -1.0,  1.0,
        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0
    ],

    cube_indices: [
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23   // left
    ],
    
    
    square: [
        0.5,0.5,
        0,0.5,
        0.5,0,
        0,0
    ]
};





class Scene {
    /// Scene class contains information on the current canvas & WebGL context and wraps it into a nice class...
    /// Scene constructor is called with the given canvas id.
    /// A main-loop function is supplied by the user as well. This may be altered later to switch graphs & stuff.

    constructor(canvas_id) {
        /// Declare the publically accessable variables defining the context - Graph Object, HTML canvas, & WebGL context.
        this.canvas = document.getElementById(canvas_id);
        this.gl = this.canvas.getContext("webgl");
        this.context = this.gl;

        if (this.gl == null){alert("Unable to initialize WebGL for Canvas" + canvas_id); return;}

        this.gl.clearColor(0.0,0.0,0.0,1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);

        //this.cam = new Camera(1);

    }
    
    main_loop(some_function) {
        some_function(this.context,this.gl,this.cam);
    }

    makeBuffer(type,data){
        let tempBuffer = this.context.createBuffer();
        this.context.bindBuffer(type, tempBuffer);
        this.context.bufferData(type, data, this.context.STATIC_DRAW);
        //this.gl.bindBuffer(type, null);
        return tempBuffer;
    
    }
}






class Shader {
    constructor(context,fragment_code=default_shader_frag,vertex_code=default_shader_vert){
        this.context = context;
        /// Create the fragment shader from the supplied code
        this.fragment_shader = context.createShader(context.FRAGMENT_SHADER);
        context.shaderSource(this.fragment_shader, fragment_code);
        context.compileShader(this.fragment_shader);

        /// Create the vertex shader from the supplied code
        this.vertex_shader = context.createShader(context.VERTEX_SHADER);
        context.shaderSource(this.vertex_shader, vertex_code);
        context.compileShader(this.vertex_shader);

        /// Create the 'full' shader 
        this.program = context.createProgram();
        context.attachShader(this.program, this.vertex_shader);
        context.attachShader(this.program, this.fragment_shader);
        context.linkProgram(this.program);
    }
    
    /// Function to bind the vertex & index buffers
    bind(vertex_buffer,index_buffer) {
        this.context.useProgram(this.program);
        this.context.bindBuffer(this.context.ARRAY_BUFFER, vertex_buffer);
        this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, index_buffer); 
    }

    /// gets the location of any uniform variable in the current program
    get_uniform_location(variable) {
        return this.context.getUniformLocation(this.program,variable);
    }
    /// Sends data to a Mat4 variable
    uniMatrix4(location,data){
        this.context.uniformMatrix4fv(location,this.context.FALSE,data);
    }

}




class line_primative{
    /// start_pos & end_pos are 2-vectors representing the start & end coordinates of the line
    constructor(start_pos,end_pos,thickness=0.5,color=[0,1.0,0.0]){
        var s = thickness/4;

        this.start = [start_pos[0],start_pos[1]];
        this.end = [end_pos[0],end_pos[1]];
        this.color = color;

        let diff = [this.end[0]-this.start[0],this.end[1]-this.start[1]];
        let length = Math.sqrt(diff[0]*diff[0]+diff[1]*diff[1]);
        let norm = [-diff[1]/length,diff[0]/length];

        this.pos = [this.start[0]-s*norm[0],this.start[1]-s*norm[1]];

        this.rotation = [diff[0]/length,-diff[1]/length,diff[1]/length,diff[0]/length];
        this.norm_scale = [length+s,0,0,thickness];
    }
    /// shorthand notation for use in a loop. i.e. a larger curve consisting of many line-segements
    send_data(context,shader){
        const mat_loc = context.getUniformLocation(shader.program,"rot");
        context.uniformMatrix2fv(mat_loc,false,this.rotation);
        const norm_loc = context.getUniformLocation(shader.program,"scale");
        context.uniformMatrix2fv(norm_loc,false,this.norm_scale);
        const pos_loc = context.getUniformLocation(shader.program,"pos");
        context.uniform2fv(pos_loc,this.pos);
        const color_loc = context.getUniformLocation(shader.program,"color");
        context.uniform3fv(color_loc,this.color);
    }

}

class parametric_curve_2d{
    constructor(x_func,y_func,start,end,num){
        this.x_function = x_func;
        this.y_function = y_func;
        this.num = num;
        this.step = (end-start)/num;
        this.thickeness = 0.05;
        this.start = start;
        this.end = end;
    }
}

class explicit_function extends parametric_curve_2d{
    constructor(y_func,min,max,num=100){
        super(function(t) {return t},y_func,min,max,num);

    }
}


function curve_create(curve,x_function,y_function,step,num){
    let curves = [];
    let fx = x_function;
    let fy = y_function;

    let old = [fx(0+curve.start),fy(0+curve.start)];
    for (var n = 0; n<curve.num; n++){
        let temp = [fx((n+1)*(step)+curve.start),fy((n+1)*(step)+curve.start)];
        (curves).push(new line_primative(old,temp,thickness=0.05,color=color_func(n*step)));
        old = temp;
    }
    return curves;
}


class arrow extends line_primative{
    constructor(start,pointing,thick=0.05){
        super(start,pointing,thickness=thick);
        this.thickness = thick;
        this.color = [1,0,0];
    }

    /// Recomputes the initially computed values such that the direction is updated corrctly. Note: user must manually change start or end positions.
    update(){
        var s = this.thickness/4;
        let diff = [this.end[0]-this.start[0],this.end[1]-this.start[1]];
        let length = Math.sqrt(diff[0]*diff[0]+diff[1]*diff[1]);
        let norm = [-diff[1]/length,diff[0]/length];
        this.pos = [this.start[0]-s*norm[0],this.start[1]-s*norm[1]];
        this.rotation = [diff[0]/length,-diff[1]/length,diff[1]/length,diff[0]/length];
        this.norm_scale = [length,0,0,thickness];
    }
}