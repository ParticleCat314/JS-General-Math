var gl_canvas = new Scene("canvas1");
var gl=gl_canvas.gl;




function main2(){

    shader1 = new Shader(gl,colorFragmentChecker,defaultVertex3D);


    let f = function(w,m) {return Math.sign(Math.sin(w))*Math.pow(Math.abs(Math.sin(w)),m)}
    let g = function(w,m) {return Math.sign(Math.cos(w))*Math.pow(Math.abs(Math.cos(w)),m)}

    let A = 1;
    let B = 1;
    let C = 1;
    let r = 0.5;
    let s = 0.75;
    let t = 2.0;




    let fx = function(u,v) {return A*g(v,2/r)*g(u,2/r)};
    let fy = function(u,v) {return B*g(v,2/s)*f(u,2/s)};
    let fz = function(u,v) {return C*f(v,2/t)};
    let surface1 = new surface(fx,fy,fz);

    const vertices = gl_canvas.makeBuffer(gl.ARRAY_BUFFER,new Float32Array(surface1.verts));
    const indices = gl_canvas.makeBuffer(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(surface1.indices));
    const normalBuffer = gl_canvas.makeBuffer(gl.ARRAY_BUFFER,new Float32Array(surface1.normals));

    gl.useProgram(shader1.program);
    shader1.bind(vertices,indices);
    let coord_atrib = gl.getAttribLocation(shader1.program,'coordinates');
    gl.vertexAttribPointer(coord_atrib, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord_atrib);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    var normals = gl.getAttribLocation(shader1.program,"normals");
    gl.vertexAttribPointer(normals,3,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(normals);
    


    let color = gl.getUniformLocation(shader1.program,"color");
    gl.uniform3fv(color,[0.25,1.0,0.34]);
    
    let view_loc = gl.getUniformLocation(shader1.program,"view");
    let projection_loc = gl.getUniformLocation(shader1.program,"projection");
    let model_loc = gl.getUniformLocation(shader1.program,"model");


    let cam = new camera([0,0,1.1]);
    let view_matrix = cam.lookAt; //mat4.create();
    let projection_matrix = cam.projection;
    let model_matrix = mat4.create();




    model_matrix = gmat4.scale(model_matrix,[0.15,0.15,0.15]);
    model_matrix = gmat4.translate(model_matrix,[-0.25,-0.5,3]);
    model_matrix = gmat4.rotate(model_matrix,-1.3,axis=[1,0,0]);


    gl.uniformMatrix4fv(view_loc,false,transpose(view_matrix));
    gl.uniformMatrix4fv(projection_loc,false,transpose(projection_matrix));
    gl.uniformMatrix4fv(model_loc,false,transpose(model_matrix));

    //console.log(view_matrix);


    total = 0.0;
    drag = false;
    let distxy = [0,0];
    let startxy = [0,0];
    let totalx = 0.0;
    let totaly = 0.0;
    let zoom = 1.0;
    let original_cam = model_matrix;
    let zoomed = false;

    function render_loop(deltaTime){
        total += deltaTime;
        gl.clearColor(0,0.1,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT)
        total += 0.0001/deltaTime;

        manage_input();
        if (drag || zoomed){
            console.log(zoom);
            totalx += 0.3*deltaTime*distxy[1];
            totaly += 0.3*deltaTime*distxy[0];
            model_matrix = gmat4.rotate(original_cam,totalx*3.14/360,[1,0,0]);
            model_matrix = gmat4.rotate(model_matrix,totaly*3.14/360,[0,0,1]);
            
            zoomed = false;
        }

        //model_matrix = gmat4.rotate(model_matrix,deltaTime,axis=[0,0,1]);
        gl.uniformMatrix4fv(model_loc,false,transpose(model_matrix));
        

        gl.drawElements(gl.LINES, (surface1.indices).length, gl.UNSIGNED_SHORT,0);
        //gl.drawElements(gl.TRIANGLES, (surface1.indices).length, gl.UNSIGNED_SHORT,0);

        //gl.drawElements(gl.TRIANGLES,surface1.indices.length,gl.UNSIGNED_SHORT,0);

        //let f1 = function (t) {return 1*0.45*Math.cos(t)-0.1*Math.sin(2.5*PI*t+total)};
        //let f2 = function (t) {return 0.45*Math.sin(t)-0.15*Math.cos(PI*t+total)};
        //var curve = new parametric_curve_2d(f1,f2,0,2*PI,3000);
        
        //let curves = curve_create(curve,curve.x_function,curve.y_function,curve.step,curve.num);
        
        //for (n in curves){
        //    curves[n].send_data(gl,shader1);
        //gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
        //}
    }
    function manage_input(){
        document.addEventListener('mousedown',(event)=>{drag=true; startxy = [event.clientX,event.clientY]},false);
        document.addEventListener('mouseup',(event)=>{drag=false;},false);
        document.addEventListener('mousemove',(event)=>{if (drag){distxy = [(event.clientX-startxy[0]),(event.clientY-startxy[1])];}},false);
        document.addEventListener('wheel', (event)=>{
            //event.preventDefault();
            if (event.shiftKey == true){console.log("Yawn"); itter += 10*event.deltaY;}
            else{
                zoom *= Math.pow(2,(-0.00001*event.deltaY));
                model_matrix = scale(original_cam,1.0001);

                zoomed = true;
            }
        },false)
    }
    loopFrame(render_loop)

}
window.onload = main2;