/// NOTE
/// The following represents my attempt at writting a simple WebGL wrapper. This was made both as a personal project, and hopefully a general tool to assist with other projects.


/// Intended structure...

/// Shader Managment:
    // Create Fragment & Vertex Shaders - Shader class (creates both & binds) & shader generation function (used to make a single shader)
    // Utility functions for binding, releasing, & other random shader stuff

/// Simple Primatives & Geometry:
    // Functions to generate polygons & simple 3d shapes (hexahedrons & spheres mainly)
    // Geometry class - used to construct arbitrary shapes. Also contains functions to bind & upload data
    // Some of the graphing stuff... idk...
        // Line primative class - simple lines with thickness & color
        // Parametric curve class - functions mostly as a general curve class - defines curves with the line primative class
            // Other common curve types may be inherited from this class.



/// Framebuffers, textures, & renderbuffer objects:
    // Rendering context - thus having an associated framebuffer. Therefore, this may inherit from the inital context creation...
    // idk more stuff I guess

/// Math stuff is currently included in the math.js file. Though this will later be moved (only relavent 3d matrix stuff)

/// SCENES:
    // Defines the WebGL context & is managed as a class... 
    // Attempting to avoid too many class-specific functions; thus the Scene class simply stores the WebGL context & some helper functions
    // Allows for the hopefully easy creation of a basic WebGL program...


// PERSONAL NOTES & To-do list:
    // Incorporate the translation & rotation matrices from the math.js file. Then generalize them for graphics programs.
    // Define the camera object with my custom matrices
    // Work on simple framebuffer effects (glow & blur stuff)... Perhaps also utilize shaders for 2d plots by using ray-marching



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
    ],

    square_screen: [
        1,1,
        -1,1,
        1,-1,
        -1,-1
    ],

    square2: class {
        constructor(canvas_context,pos=[0,0,0],scale=[1,1,1]){
            this.context = context;
            this.pos = pos;
            this.scale = scale;

            this.vertices = canvas_context.makeBuffer(gl.ARRAY_BUFFER,new Float32Array(primative.square_screen));
            //this.indices = canvas_context.makeBuffer(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(bounding_indices));
        }

        draw(gl,shader){
            gl.bindBuffer(this.vertices);
            gl.drawArrays(gl.TRIANGLE_STRIP,0,6);
        }
    },

    draw: function(type){

    }
};






class Scene {
    // Scene class contains information on the current canvas & WebGL context and wraps it into a nice class...
    // Scene constructor is called with the given canvas id.
    // A main-loop function is supplied by the user as well. This may be altered later to switch graphs & stuff.

    constructor(canvas_id) {
        // Declare the publically accessable variables defining the context - Graph Object, HTML canvas, & WebGL context.
        this.canvas = document.getElementById(canvas_id);
        this.gl = this.canvas.getContext("webgl");
        this.context = this.gl;

        if (this.gl == null){alert("Unable to initialize WebGL for Canvas" + canvas_id); return;}

        this.gl.clearColor(0.0,0.0,0.0,1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);

        // this.cam = new Camera(1);

    }
    
    main_loop(some_function) {
        some_function(this.context,this.gl,this.cam);
    }

    makeBuffer(type,data){
        let tempBuffer = this.context.createBuffer();
        this.context.bindBuffer(type, tempBuffer);
        this.context.bufferData(type, data, this.context.STATIC_DRAW);
        this.gl.bindBuffer(type, null);
        return tempBuffer;
    
    }
}






class Shader {
    constructor(context,fragment_code=colorFragment,vertex_code=defaultVertex){
        this.context = context;
        // Create the fragment shader from the supplied code
        this.fragment_shader = context.createShader(context.FRAGMENT_SHADER);
        context.shaderSource(this.fragment_shader, fragment_code);
        context.compileShader(this.fragment_shader);
        console.log(gl.getShaderInfoLog(this.fragment_shader));

        // Create the vertex shader from the supplied code
        this.vertex_shader = context.createShader(context.VERTEX_SHADER);
        context.shaderSource(this.vertex_shader, vertex_code);
        context.compileShader(this.vertex_shader);

        // Create the 'full' shader 
        this.program = context.createProgram();
        context.attachShader(this.program, this.vertex_shader);
        context.attachShader(this.program, this.fragment_shader);
        context.linkProgram(this.program);

        //if (vertex_code = defaultVertex){
        //    context.useProgram(this.program);
        //    this.world_loc = context.getUniformLocation(this.program,"world");
        //    this.pos_loc = context.getUniformLocation(this.program,"pos");
        //    this.rot_loc = context.getUniformLocation(this.program,"rot");
        //    this.scale_loc = context.getUniformLocation(this.program,"scale");
        //    context.uniformMatrix2fv(this.world_loc,false,[1,0,0,1]);
        //    context.uniform2fv(this.pos_loc,[0,0]);
        //    context.uniformMatrix2fv(this.rot_loc,false,[1,0,0,1]);
        //    context.uniformMatrix2fv(this.scale_loc,false,[1,0,0,1]);
        //}
    }
    
    // Function to bind the vertex & index buffers
    bind(vertex_buffer,index_buffer) {
        this.context.useProgram(this.program);
        this.context.bindBuffer(this.context.ARRAY_BUFFER, vertex_buffer);
        this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, index_buffer); 
    }

    // gets the location of any uniform variable in the current program
    get_uniform_location(variable) {
        return this.context.getUniformLocation(this.program,variable);
    }
    // Sends data to a Mat4 variable
    uniMatrix4(location,data){
        this.context.uniformMatrix4fv(location,this.context.FALSE,data);
    }

}

class camera{
    constructor(pos,fov=60,ratio){
        this.target = [0,0,0];
        this.dir = [-pos[0],-pos[1],-pos[2]];
        this.up = [0,1,0];
        this.right = vec3.normalize(vec3.cross(this.dir,this.up));
        let temp1 = [this.right[0],this.right[1],this.right[2],0,this.up[0],this.up[1],this.up[2],0,this.dir[0],this.dir[1],this.dir[2],0,0,0,0,1];
        let temp2 = mat4.create();
        temp2[3] = -pos[0];
        temp2[7] = -pos[1];
        temp2[11] = -pos[2];
        this.fov = fov;
        this.lookAt = mat4.dot(temp1,temp2);
        this.projection = persepective(fov,0.1,1000.0,ratio);
    }
    viewportChanged(aspect_ratio){
        this.projection = persepective(this.fov,0.1,1000.0,aspect_ratio);
    }    
}
class OrbitCam extends camera{
    constructor(position,fov,aspect_ratio){
        super(position,fov=fov,aspect_ratio);
        this.context = 0;//context;
        this.startxy = [0,0];
        this.deltaxy = [0,0];
        this.totalxy = [0,0];
        this.model = 0;
    }

    rotate(distxy,delta,model_rot,old){

        
        this.totalxy[0] += 0.3*delta*distxy[1];
        this.totalxy[1] += 0.3*delta*distxy[0];
        model_rot = gmat4.rotate(old,-this.totalxy[0]*3.14/360,[0,0,1]);
        let temp = gmat4.rotate(model_rot,-this.totalxy[1]*3.14/360,[0,1,0]);
        model_rot = temp;
        return temp;
        
        
    }
}
/// The following functions are used to handle off-screen rendering processes.
/// I should probably condense these into a class - then the user will be able to manually adjust the specifics of the initialization process...

function genScreenTexture(gl,width,height){
    // Receives a WebGL context, x-resolution, & y-resolution. Returns a new texture to render to.
    // Returns the WebGL reference to this texture.
    gl.getExtension('OES_texture_float');
    let target_texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,target_texture);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,width,height,0,gl.RGBA,gl.FLOAT,null);
    //gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_BASE_LEVEL,0);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    //gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    return target_texture
}

function genRenderBuffer(gl,render_target,color_attachment = gl.COLOR_ATTACHMENT0){
    // This function creates a new framebuffer with the input as a texture. Note: best used in combination with genScreenTexture.
    // Returns the WebGL reference to this framebuffer.
    let fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER,fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, color_attachment, gl.TEXTURE_2D, render_target, 0);
    return fb;
}


function bindRenderTarget(gl,frameBuffer,width,height){
    // Simple function to bind to a framebuffer while adjusting the viewport dimensions. 
    // Adjusting the size of the viewport is very importent to ensure correct dimensions.
    gl.bindFramebuffer(gl.FRAMEBUFFER,frameBuffer);
    gl.viewport(0,0,width,height);
}


function loopFrame(render_loop){
    let then = 0;

    function render(now,render_function=render_loop){
        now *= 0.001;
        const deltaTime = now-then;
        then = now;
        render_function(deltaTime);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}



class line_primative{
    // start_pos & end_pos are 2-vectors representing the start & end coordinates of the line
    constructor(start_pos,end_pos,thickness=0.05,color=[0,1.0,0.0]){
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
    // shorthand notation for use in a loop. i.e. a larger curve consisting of many line-segements
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
    constructor(x_func,y_func,start,end,num,thick=0.01){
        this.x_function = x_func;
        this.y_function = y_func;
        this.num = num;
        this.step = (end-start)/num;
        this.thickeness = thick;
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
        (curves).push(new line_primative(old,temp,thickness=curve.thickeness,color=color_func(n*step)));
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

    // Recomputes the initially computed values such that the direction is updated corrctly. Note: user must manually change start or end positions.
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







// Function designed to take a function as input & produce a 3D surface... or at least the vertices & indices required.
function R3_Verts(some_functionx,some_functiony,some_functionz,resolution=150) {
    var rangex = PI+PI/150;
    var rangey = 2*PI+0.1;
    var gridx = resolution;
    var gridy = resolution;
    var stepx = rangex/resolution;
    var stepy = rangey/resolution;



    let initialx = -PI/2;
    let initialy = -PI;

    var R3_verticies = [];


    var R3_indices = [];
    var R3_normals = [];
    var R3_normals2 = [];


    for (var i = 0; i<gridx; i++){
        for (var j = 0; j<gridy; j++){
            var index_x = stepx*i + initialx;
            var index_y = stepy*j + initialy;
    
            R3_verticies.push(some_functionx(index_x,index_y));
            R3_verticies.push(some_functiony(index_x,index_y));
            R3_verticies.push(some_functionz(index_x,index_y));
    
        }
    }
    for (var i = 0; i<gridx; i++){
        for (var j = 0; j<gridy; j++){
            var index_x = stepx*i + initialx;
            var index_y = stepy*j + initialy;

            let v1 = [some_functionx(index_x,index_y),some_functiony(index_x,index_y),some_functionz(index_x,index_y)];
            let v2 = [some_functionx(index_x+stepx,index_y),some_functiony(index_x,index_y),some_functionz(index_x+stepx,index_y)];
            let v3 = [some_functionx(index_x,index_y),some_functiony(index_x,index_y+stepy),some_functionz(index_x,index_y+stepy)];

            let vc1 = [v2[0]-v1[0],v2[1]-v1[1],v2[2]-v1[2]];
            let vc2 = [v3[0]-v1[0],v3[1]-v1[1],v3[2]-v1[2]];
            let final = vec3.normalize(vec3.cross(vc1,vc2));
            //console.log(final);
            R3_normals.push(final);
    
        }
    }
    
    for (var i = 0; i<gridx-1; i++){
        for (var j = 0; j<gridy-1; j++){
    
            var v = gridx*i + j;
    
            R3_indices.push(v);
            R3_indices.push(v+1);
            R3_indices.push(v+gridx+1);
    
            R3_indices.push(v);
            R3_indices.push(v+gridx+1);
            R3_indices.push(v+gridx);
            //R3_indices.push(v);
            //R3_indices.push(v+gridx);
            //R3_indices.push(v+gridx+1);
    
    
        }
    }

    for (var i = 0; i<gridx-1; i++){
        for (var j = 0; j<gridy-1; j++){
            let index = i*(gridx)+j;
    

            R3_indices.push(R3_normals[v]);
            R3_indices.push(R3_normals[v+1]);
            R3_indices.push(R3_normals[v+gridx+1]);
    
            R3_indices.push(R3_normals[v]);
            R3_indices.push(R3_normals[v+gridx+1]);
            R3_indices.push(R3_normals[v+gridx]);
            //R3_indices.push(v);
            //R3_indices.push(v+gridx);
            //R3_indices.push(v+gridx+1);
    
    
        }
    }
    //console.log(R3_normals)

    return [R3_verticies,R3_indices,R3_normals.flat()];

}

class surface {
    constructor(eq1,eq2,eq3){
        let fx = function(u,v) {return 0.5*(2-Math.cos(v))*Math.cos(u);}
        let fy = function(u,v) {return 0.5*(2-Math.cos(v))*Math.sin(u);}
        let fz = function(u,v) {return 0.5*Math.sin(v)};
        let surface = R3_Verts(eq1,eq2,eq3);
        this.verts = surface[0];
        this.indices = surface[1];
        this.normals = surface[2];
    }
}