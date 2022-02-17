var gl_canvas = new Scene("canvas1");
var gl=gl_canvas.gl;

var int_frag = `
precision highp float;
uniform vec2 res;
uniform vec3 color;

float potential(vec2 p) {
    return float(p.y < 5. || p.y > 795.0 - 5.0 || (p.x < 795.0/2.0 && int(p.y) == int(795.0/2.0)));
}

#define cis(theta) vec2(cos(theta),sin(theta))
#define length2(p) dot(p,p) 

vec2 psi0(vec2 p) { 
    p = p/800.0 - 0.5; p.x *= 1.0; return exp(-70.0*length2(p+vec2(0.675,0.225))) * cis(250.0*(p.x+p.y));
}

void main() {
    vec2 v = psi0(gl_FragCoord.xy-400.0);
    gl_FragColor = vec4(v,0.0,0.0);
}
`;
var int_vert = `
precision mediump float; 
attribute vec3 coordinates;
void main() {
    gl_Position = vec4(coordinates, 1.0);
}
`;

var frag = `
precision highp float;
varying highp vec2 v_texcoord;
uniform sampler2D u_texture;
uniform sampler2D u_texture2;

uniform vec3 step;

float dt = 0.25;
float dx = 1.0;

vec2 divi(vec2 c){return vec2(c.y,-c.x);} 

float potential(vec2 p) {
    return float(p.y < 5. || p.y > 795.0 - 5.0 || (p.x < 795.0/2.0 && int(p.y) == int(795.0/2.0)));
}

#define psi(p) texture2D(u_texture,v_texcoord+p).rg



vec2 rk(vec2 yr, vec2 laplacian){
    vec2 new_thing = -laplacian + (potential(gl_FragCoord.xy)*yr); 
    return divi(new_thing);
}


void main() {
    float offset = 1.0/800.0;
    vec2 N = vec2(0,offset);
    vec2 S = vec2(0,-offset);
    vec2 E = vec2(offset,0);
    vec2 W = vec2(-offset,0);
    vec2 c = v_texcoord.xy;
    //vec2 PSI = psi(c);


    if (step.x == 1.0){
        #define y1(p) psi(p)
        vec2 laplacian = y1(c+N)+y1(c+S)+y1(c+E)+y1(c+W)-4.0*y1(c);

        vec2 rk1 = rk(psi(c),laplacian);
        gl_FragColor = vec4(psi(c),rk1);
    }
    
    
    else if (step.x==2.0){
        #define y2(p) (psi(p) + 0.5*dt*texture2D(u_texture,p).ba)
        vec2 last = texture2D(u_texture,v_texcoord).ba;
        vec2 laplacian = y2(c+N)+y2(c+S)+y2(c+E)+y2(c+W)-4.0*y2(c);

        vec2 rk2 = rk(y2(c),laplacian);
        gl_FragColor = vec4(psi(c),rk2);
    }


    else if (step.x==3.0){
        #define y3(p) (psi(p) + 0.5*dt*texture2D(u_texture2,p).ba)
        vec2 last = texture2D(u_texture2,v_texcoord).ba;

        vec2 laplacian = y3(c+N)+y3(c+S)+y3(c+E)+y3(c+W)-4.0*y3(c);
        vec2 rk3 = rk(psi(c)+0.5*dt*last,laplacian);
        gl_FragColor = vec4(y3(c),rk3);
    }

    else if (step.x==4.0){
        #define y4(p) (psi(p) + dt*texture2D(u_texture2,p).ba)
        vec2 rk1 = texture2D(u_texture,v_texcoord).ba;
        vec2 rk2 = texture2D(u_texture2,v_texcoord).rg;
        vec2 rk3 = texture2D(u_texture2,v_texcoord).ba;

        vec2 laplacian = y4(c+N)+y4(c+S)+y4(c+E)+y4(c+W)-4.0*y4(c);
        vec2 last = rk(psi(c)+dt*rk3,laplacian);


        vec2 rk4 = psi(c) + (dt * (rk1+2.0*rk2+2.0*rk3+last)/6.0);
        
        gl_FragColor = vec4(psi(c),0.0,1.0);
    }
    else {
        gl_FragColor = vec4(texture2D(u_texture2,v_texcoord).rg*1.0,1.0,1.0)*0.001;
    }

}
`;

var vert = `
precision mediump float; 
attribute vec3 coordinates;
attribute vec2 a_texcoord;
varying highp vec2 v_texcoord;

void main() {
    //vec2 new_pos = (((coordinates.xy*scale)*rot)+pos)+vec2(1,1)*world;
    gl_Position = vec4(coordinates, 1.0);
    v_texcoord = a_texcoord;
}
`;



var tex = [
    0,0,
    0,1,
    1,0,
    1,1,

]

function main(){

    /// Declare the shader files' source & setup the square vertices
    const screen = new Shader(gl,textureFragment,textureVertex);
    const shader1 = new Shader(gl,frag,vert);
    const shader_initial = new Shader(gl,int_frag,int_vert);


    const vertices = gl_canvas.makeBuffer(gl.ARRAY_BUFFER,new Float32Array(primative.square_screen));

    gl.useProgram(shader1.program);
    let coord_atrib = gl.getAttribLocation(shader1.program,'coordinates');
    gl.vertexAttribPointer(coord_atrib, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord_atrib);

    coord_atrib = gl.getAttribLocation(screen.program,'coordinates');
    gl.vertexAttribPointer(coord_atrib, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord_atrib);

    const tex_coord = gl.getAttribLocation(screen.program,'a_texcoord');
    let buff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buff);
    gl.enableVertexAttribArray(tex_coord);
    gl.vertexAttribPointer(tex_coord, 2, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(tex),gl.STATIC_DRAW)

    const tex_coord2 = gl.getAttribLocation(shader1.program,'a_texcoord');
    let buff2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buff2);
    gl.enableVertexAttribArray(tex_coord2);
    gl.vertexAttribPointer(tex_coord2, 2, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(tex),gl.STATIC_DRAW)


    /// Declare both the x & y components for a parametric function
    /// let f1 = function (t) {return 0.45*Math.cos(t)};
    /// let f2 = function (t) {return 0.45*Math.sin(t)};
    /// var curve = new parametric_curve_2d(f1,f2);
    /// var curve = new parametric_curve_2d(f1,f2,0,2*PI,300);
    /// let curves = curve_create(curve,curve.x_function,curve.y_function,curve.step,curve.num);
    /// let vector1 = new arrow([0,0],[1/Math.sqrt(2),1/Math.sqrt(2)]);

    
    /// Just some linear algebra house-keeping
    let total = 0;
    let world_transform = [0,0,0,0];
    gl.useProgram(shader1.program);

    const color_loc = gl.getUniformLocation(shader1.program,"color");
    gl.uniform3fv(color_loc,[1,0,1]);
    const tex_loc_main = gl.getUniformLocation(screen.program,"u_texture");
    const tex_loc_BufferA = gl.getUniformLocation(shader1.program,"u_texture");
    const tex_loc_BufferB = gl.getUniformLocation(shader1.program,"u_texture2");

    const step_coord = gl.getUniformLocation(shader1.program,"step");
    let drag = false;
    let startxy = [0,0];
    let distxy = [0,0];

    /// keyboard_transform();


    const target_texture = genScreenTexture(gl,800,800);
    const target_textureA = genScreenTexture(gl,800,800);
    const target_textureB = genScreenTexture(gl,800,800);
    const target_textureC = genScreenTexture(gl,800,800);


    const fb_final = genRenderBuffer(gl,target_texture);    /// Store Psi & the first rk
    const fb1 = genRenderBuffer(gl,target_textureA);        /// Store Psi & the second rk
    const fb2 = genRenderBuffer(gl,target_textureB);        ///Store 3rd rk & final psi
    const fb3 = genRenderBuffer(gl,target_textureC);        ///Store 3rd rk & final psi


    gl.useProgram(shader_initial.program);
    bindRenderTarget(gl,fb_final,800,800);

    gl.clearColor(0,0.0,0,0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);

    gl.useProgram(shader1.program);

    gl.uniform1i(tex_loc_BufferA,0);
    gl.uniform1i(tex_loc_BufferB,1);

    function render_loop(gl,delta){
        total += delta;
        gl.useProgram(shader1.program);


        /// Psi & RK1 - textureA
        bindRenderTarget(gl,fb1,800,800);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,target_texture);
        //gl.uniform1i(tex_loc_BufferA,0);
        gl.uniform3fv(step_coord,[1,0,0]);
        //gl.clearColor(0,0,0,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP,0,4);

        /// Psi & RK2 - textureB
        bindRenderTarget(gl,fb2,800,800);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,target_textureA);
        //gl.uniform1i(tex_loc_BufferA,0);
        gl.uniform3fv(step_coord,[2,0,0]);
        //gl.clearColor(0,0,0,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP,0,4);

        /// RK2 & RK3
        bindRenderTarget(gl,fb3,800,800);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,target_textureA);
        //gl.uniform1i(tex_loc_BufferA,0);
        gl.uniform3fv(step_coord,[3,0,0]);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D,target_textureB);
        //gl.uniform1i(tex_loc_BufferB,1);
        //gl.clearColor(0,0.1,0,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP,0,4);

        gl.bindTexture(gl.TEXTURE_2D, null);
       bindRenderTarget(gl,fb_final,800,800);
       gl.activeTexture(gl.TEXTURE0);
       gl.bindTexture(gl.TEXTURE_2D,target_textureA);
       //gl.uniform1i(tex_loc_BufferA,0);
       gl.uniform3fv(step_coord,[4,0,0]);
       gl.activeTexture(gl.TEXTURE1);
       gl.bindTexture(gl.TEXTURE_2D,target_textureB);
       //gl.uniform1i(tex_loc_BufferB,1);
       //gl.clearColor(0,0.1,0,1.0);
       gl.clear(gl.COLOR_BUFFER_BIT);
       gl.drawArrays(gl.TRIANGLE_STRIP,0,4);

        
       gl.bindTexture(gl.TEXTURE_2D, null);
        bindRenderTarget(gl,null,800,800);
        gl.useProgram(screen.program);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,target_texture);
        gl.uniform1i(tex_loc_main,target_texture);
        gl.clearColor(0,0.0,0,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
        
        
        
        
        
        
        
        
        
        //gl.flush();

        /*
        let time = -Math.abs(Math.sin(0.5*total))+0.75;
        gl.clearColor(0,0.1,0,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        if (drag){
            world_transform[0] += 0.003*delta*distxy[0];
            world_transform[3] += -0.003*delta*distxy[1];

        }

        for (n in curves){
            curves[n].color = color_func(n*curve.step-5*total);
            curves[n].send_data(gl,shader1);
            gl.uniformMatrix2fv(world_loc,false,world_transform);
        
            gl.drawArrays(gl.TRIANGLE_STRIP,0,4);    

        }
        vector1.end = [Math.cos(5*total),Math.sin(5*total)];
        vector1.update();
        vector1.send_data(gl,shader1);
        gl.drawArrays(gl.TRIANGLE_STRIP,0,4);    

*/


    }


    function keyboard_transform(){
        document.addEventListener('mousedown',(event)=>{drag=true; startxy = [event.clientX,event.clientY]},false);
        document.addEventListener('mouseup',(event)=>{drag=false;},false);
        document.addEventListener('mousemove',(event)=>{if (drag){distxy = [(event.clientX-startxy[0]),(event.clientY-startxy[1])];}},false);      
    }



    
    let then = 0;
    function render(now,render_function=render_loop){
        now *= 0.001;
        const deltaTime = now-then;
        then = now;
        render_function(gl,deltaTime);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

function main2(){

    shader1 = new Shader(gl,colorFragment,defaultVertex);

    const vertices = gl_canvas.makeBuffer(gl.ARRAY_BUFFER,new Float32Array(primative.square_screen));

    gl.useProgram(shader1.program);
    let coord_atrib = gl.getAttribLocation(shader1.program,'coordinates');
    gl.vertexAttribPointer(coord_atrib, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord_atrib);

    let f1 = function (t) {return 0.45*Math.cos(t)};
    let f2 = function (t) {return 0.45*Math.sin(t)};
    var curve = new parametric_curve_2d(f1,f2,0,2*PI,300);
    let curves = curve_create(curve,curve.x_function,curve.y_function,curve.step,curve.num);


    function render_loop(){
        gl.clearColor(0,0,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT)
        for (n in curves){
            curves[n].send_data(gl,shader1);
            gl.drawArrays(gl.TRIANGLE_STRIP,0,4);


        }
    }

    let then = 0;
    function render(now,render_function=render_loop){
        now *= 0.001;
        const deltaTime = now-then;
        then = now;
        render_function(gl,deltaTime);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}


window.onload = main;

/*
window.onresize = function() {
    var w = document.getElementById("canvas1");
    w.width = window.innerWidth;
    w.height = window.innerHeight;
    gl.viewport(0,0,w.width,w.height);

};
*/