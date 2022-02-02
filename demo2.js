var gl_canvas = new Scene("canvas1");
var gl=gl_canvas.gl;



function main2(){

    shader1 = new Shader(gl,colorFragment,defaultVertex);

    const vertices = gl_canvas.makeBuffer(gl.ARRAY_BUFFER,new Float32Array(primative.square_screen));

    gl.useProgram(shader1.program);
    let coord_atrib = gl.getAttribLocation(shader1.program,'coordinates');
    gl.vertexAttribPointer(coord_atrib, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord_atrib);

    let f1 = function (t) {return 0.45*Math.cos(t)};
    let f2 = function (t) {return 0.45*Math.sin(t)};
    
    let x = function(t) {return 0.03*(16*Math.sin(t)*Math.sin(t)*Math.sin(t))};
    let y = function(t) {return 0.03*(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))};

    var curve = new parametric_curve_2d(f1,f2,0,2*PI,300);
    let curves = curve_create(curve,curve.x_function,curve.y_function,curve.step,curve.num);

    total = 0.0;

    function render_loop(deltaTime){
        gl.clearColor(0,0.1,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT)
        total += 0.0001/deltaTime;
        
        let f1 = function (t) {return 1*0.45*Math.cos(t)-0.1*Math.sin(2.5*PI*t*total)};
        let f2 = function (t) {return 0.45*Math.sin(t)-0.15*Math.cos(2*PI*t*total)};
        var curve = new parametric_curve_2d(f1,f2,0,2*PI,3000);

    
        let curves = curve_create(curve,curve.x_function,curve.y_function,curve.step,curve.num);

        for (n in curves){
            curves[n].send_data(gl,shader1);
            gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
        }
    }



    loopFrame(render_loop)

}
window.onload = main2;