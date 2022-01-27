//// Custom header thing for the math stuff I need in my projects... This is all done in pure javascript - no libraries used for now (except js Math)

const PI = 3.141592653589793238462643383;
const E = 2.71828;

//// Didn't want to, but kinda thought it was best - defining the 2x2 matrix operations as well. Mostly cause adjugate computations & stuff use 2x2 matrices
var mat2 = {
    // Function to generate 2x2 identity matrix
    create: function (array = new Float32Array(4)) {
        array = [1,0,0,1]; // Decided that hardcoding this was probably more efficient than another loop
        return array;
    },

    dot: function (matrixA,matrixB){
        if (matrixA.length != matrixB.length){
            throw 'cannot multiply two or more non 2x2 matrices with the 2x2 multiplication function, silly human';
        }
        var temp = [
        matrixA[0]*matrixB[0]+matrixA[1]*matrixB[2],
        matrixA[0]*matrixB[1]+matrixA[1]*matrixB[3],
        matrixA[2]*matrixB[0]+matrixA[3]*matrixB[2],
        matrixA[2]*matrixB[1]+matrixA[3]*matrixB[3]
        ]
        return temp;
    },

    det: function(matrix){
        return matrix[0]*matrix[3]-matrix[1]*matrix[2];
    },

    invert: function(matrix){
        const rdet = 1/mat2.det(matrix);
        return [rdet*matrix[3],-rdet*matrix[1],-rdet*matrix[2],rdet*matrix[0]];
    }

}


//// gonna need a 3x3 Matrix & operations
var mat3 = {
    // Function to generate 3x3 identity matrix from a Float32Array
    create: function (array= new Float32Array(9)){
        for (var n = 0; n<9; n++){
            if (n%4==0){array[n] = 1;}
            else {array[n] = 0;}
        }
        // hardcoding this is again probably more efficient than another loop???
        return array;
    },


    // Calculates the dot product of two matrices
    dot: function (matrixA,matrixB){
        if (matrixA.length != matrixB.length){
            throw 'cannot multiply two non 3x3 matrices with the 3x3 multiplication function, silly human';
        }
        var temp = []
        for (var n = 0; n<9; n++){
            var row = ~~(n/3);
            var p1 = matrixA[3*row]*matrixB[n%3];
            var p2 = matrixA[3*row+1]*matrixB[n%3+3];
            var p3 = matrixA[3*row+2]*matrixB[n%3+6];
            temp.push(p1+p2+p3);
        }

        return temp;
    },

    // Calculate the determinant of a matrix
    det: function (matrix){
        var det = matrix[0]*(matrix[4]*matrix[8]-matrix[5]*matrix[7]) - matrix[1]*(matrix[3]*matrix[8]-matrix[5]*matrix[6]) + matrix[2]*(matrix[3]*matrix[7]-matrix[4]*matrix[6]);
        return det;
    },

    invert: function (matrix){
        const determinant = mat3.det(matrix);
        const adjugate = mat3.adjugate(transpose(matrix));
        var temp = new Float32Array(matrix.length);

        if (determinant != 0) {
            for (num in temp){
                temp[num] = adjugate[num]/determinant;
                if (num%2 == 1) {temp[num] *= -1;}
            }
            return temp;
        }
        else {
            throw 'No inverse when determinate equels zero...'
        }
    },

    adjugate: function(matrix){
        const o = matrix;       /// just the original matrix with a short variable name because it helps
        let temp = new Float32Array(o.length);
        let m1 = mat2.det([o[4],o[5],o[7],o[8]]);
        let m2 = mat2.det([o[3],o[5],o[6],o[8]]);
        let m3 = mat2.det([o[3],o[4],o[6],o[7]]);
        let m4 = mat2.det([o[1],o[2],o[7],o[8]]);
        let m5 = mat2.det([o[0],o[2],o[6],o[8]]);
        let m6 = mat2.det([o[0],o[1],o[6],o[7]]);
        let m7 = mat2.det([o[1],o[2],o[4],o[5]]);
        let m8 = mat2.det([o[0],o[2],o[3],o[5]]);
        let m9 = mat2.det([o[0],o[1],o[3],o[4]]);
        return [m1,m2,m3,m4,m5,m6,m7,m8,m9];
    },

    rotateX: function(matrix,theta){
        const cos_angle = Math.cos(theta);
        const sin_angle = Math.sin(theta);
        var temp = [1,0,0,0,cos_angle,sin_angle,0,-sin_angle,cos_angle];
        return mat3.dot(matrix,temp);
    },
    rotateY: function(matrix,theta){
        const cos_angle = Math.cos(theta);
        const sin_angle = Math.sin(theta);
        var temp = [cos_angle,0,-sin_angle,0,1,0,sin_angle,0,cos_angle];
        return mat3.dot(matrix,temp);
    },
    rotateZ: function(matrix,theta){
        const cos_angle = Math.cos(theta);
        const sin_angle = Math.sin(theta);
        var temp = [cos_angle,sin_angle,0,-sin_angle,cos_angle,0,0,0,1];
        return mat3.dot(matrix,temp);
    },

    // Rotate around an arbitrary axis
    // Constructs a new matrix from the identity atm for debugging purposes
    rotateN: function(matrix,axis,theta){
        /// Normalize the rotation axis cause it's nicer to work with...
        var id = mat3.create();
        const normalized_axis = vec3.normalize(axis);
        const compx_angle = vec3.angle(normalized_axis,[1,0,1]);
        const compy_angle = vec3.angle([normalized_axis[0],0,normalized_axis[2]],[0,0,1]);
        const compz_angle = vec3.angle([0,0,normalized_axis[2]],[0,0,0]);

        /// Angles are always in radians lol
        var rot1 = mat3.rotateZ(id,compx_angle);
        var rot2 = mat3.rotateY(id,compy_angle);
        var rot3 = mat3.rotateZ(id,theta);

        var final = (mat3.dot(rot1,rot2),rot3);
        final = mat3.dot(final,mat3.invert(rot2));
        final = mat3.dot(final,mat3.invert(rot1));

        return final;
        
    }
}



//// gonnna need a 4x4 Matrix & operations.
//// Probably gonna be more detailed than 3x3 stuff... probably cause it's more useful for camera stuff too idk.

var mat4 = {
    //// This one becomes incredibly specific to WebGL rather than general operations.

    create: function (array = new Float32Array(16)){
    for (var n = 0; n<16; n++){
        if (n%5==0){array[n] = 1;}
        else {array[n] = 0;}
    }
    return array;
    },

    dot: function (matrixA,matrixB){
        if (matrixA.length != matrixB.length){
            throw 'cannot multiply two non 4x4 matrices with the 4x4 multiplication function, silly human';
        }
        var temp = []
        for (var n = 0; n<16; n++){
            var row = ~~(n/4);
            var p1 = matrixA[4*row]*matrixB[n%4];
            var p2 = matrixA[4*row+1]*matrixB[n%4+4];
            var p3 = matrixA[4*row+2]*matrixB[n%4+8];
            var p4 = matrixA[4*row+3]*matrixB[n%4+12];
            temp.push(p1+p2+p3+p4);
        }

        return temp;
    },

    // Translate by adding the 3-vector into the fourth column...
    // Note this adds to the current value - does not translate from the origin unless translation is already null
    translate: function(matrix,vec3){
        if (matrix.length != 16) {
            throw 'must provide a 4x4 matrix as input'
        }

        var temp = matrix;
        temp[3] += vec3[0];
        temp[7] += vec3[1];
        temp[11] += vec3[2];

        return temp;
    },

    determinant: function(matrix){
        var m = matrix;   /// Just make the name shorter cause writting this next part is a pain.
        //var det = (m[0]*m[5]*m[10]*m[15]) + (m[4]*m[9]*m[14]*m[3]) + (m[8]*m[13]*m[2]*m[7]) + (m[12]*m[1]*m[6]*m[11]);
        //console.log(det);
        //det = det-((m[3]*m[6]*m[9]*m[12]) + (m[7]*m[10]*m[13]*m[0]) + (m[11]*m[14]*m[1]*m[4]) + (m[15]*m[2]*m[5]*m[8]));
        //var det = m[0]*(m[5]*m[10]*m[15]+m[9]*m[14]*m[6]+m[13]*m[6]*m[11] - (m[7]*m[10]*m[13]+m[11]*m[14]*m[5]+m[15]*m[6]*m[9]));
        
        var det1 = m[0]*mat3.det([m[5],m[6],m[7],m[9],m[10],m[11],m[13],m[14],m[15]]);
        var det2 = m[1]*mat3.det([m[4],m[6],m[7],m[8],m[10],m[11],m[12],m[14],m[15]]);
        var det3 = m[2]*mat3.det([m[4],m[5],m[7],m[8],m[9],m[11],m[12],m[13],m[15]]);
        var det4 = m[3]*mat3.det([m[4],m[5],m[6],m[8],m[9],m[10],m[12],m[13],m[14]]);

        
    
        return [det1-det2+det3-det4];


    },


    /// This is not designed for speed or efficiency...
    invert: function(matrix){
        var m = matrix;

        
        
        var determinant_mat4 = mat4.determinant(matrix);
        if (determinant_mat4 == 0) {throw 'determinant equels zero';}
        var temp = mat4.adjoint(matrix);
        console.log(temp);
        temp = scale(temp,1/determinant_mat4);
        return temp;

    },

    adjoint: function(matrix){
        var m = matrix;

        var e0 = mat3.det([m[5],m[6],m[7],m[9],m[10],m[11],m[13],m[14],m[15]]);
        var e1 = -mat3.det([m[4],m[6],m[7],m[8],m[10],m[11],m[12],m[14],m[15]]);
        var e2 = mat3.det([m[4],m[5],m[7],m[8],m[9],m[11],m[12],m[13],m[15]]); 
        var e3 = -mat3.det([m[4],m[5],m[6],m[8],m[9],m[10],m[12],m[13],m[14]]); 
        var e4 = mat3.det([m[1],m[2],m[3],m[9],m[10],m[11],m[13],m[14],m[15]]);
        var e5 = -mat3.det([m[0],m[2],m[3],m[8],m[10],m[11],m[12],m[14],m[15]]);
        var e6 = mat3.det([m[0],m[1],m[3],m[8],m[9],m[11],m[12],m[13],m[15]]); 
        var e7 = -mat3.det([m[0],m[1],m[2],m[8],m[9],m[10],m[12],m[13],m[14]]); 
        var e8 = mat3.det([m[1],m[2],m[3],m[5],m[6],m[7],m[13],m[14],m[15]]);
        var e9 = -mat3.det([m[0],m[2],m[3],m[4],m[6],m[7],m[12],m[14],m[15]]);
        var e10 = mat3.det([m[0],m[1],m[3],m[4],m[5],m[7],m[12],m[13],m[15]]);
        var e11 = -mat3.det([m[0],m[1],m[2],m[4],m[5],m[6],m[12],m[13],m[14]]);
        var e12 = mat3.det([m[1],m[2],m[3],m[5],m[6],m[7],m[9],m[10],m[11]]); 
        var e13 = -mat3.det([m[0],m[2],m[3],m[4],m[6],m[7],m[8],m[10],m[11]]); 
        var e14 = mat3.det([m[0],m[1],m[3],m[4],m[5],m[7],m[8],m[9],m[11]]);
        var e15 = -mat3.det([m[0],m[1],m[2],m[4],m[5],m[6],m[8],m[9],m[10]]);

        var temp = transpose([e0,e1,e2,e3,e4,e5,e6,e7,e8,e9,e10,e11,e12,e13,e14,e15]);
        return temp;

    }








}


//// Some vector stuff now
var vec3 = {
    // Just the regular old dot-product
    dot: function (a,b) {
        return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
    },

    // Cross product - two vector inputs
    cross: function (a,b) {
        var cx = a[1]*b[2] - a[2]*b[1];
        var cy = a[2]*b[0] - a[0]*b[2];
        var cz = a[0]*b[1] - a[1]*b[0];
        return [cx,cy,cz];
    },

    length: function(a){
        return Math.sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2]);
    },

    // Normalize the vector - probably should generalize this n-vectors huh?
    normalize: function(a){
        const dist = Math.sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2]);
        return [a[0]/dist,a[1]/dist,a[2]/dist];
    },

    // Calculate the angle between two vectors using a rather sloppy method involving inverse cosine lol
    angle: function(a,b) {
        return Math.acos((vec3.dot(a,b))/(vec3.length(a)*vec3.length(b)));
    }

}

//// Some Quaternion stuff cause it seems more efficient for rotations
var quaternion = {
    /// Initialize the quaternion from an axis & angle
    create: function(axis,angle){
        const sin_angle2 = Math.sin(angle/2);
        const cos_angle2 = Math.cos(angle/2);
        var q = [cos_angle2,axis[0]*sin_angle2,axis[1]*sin_angle2,axis[2]*sin_angle2];
        q = scale(q,1/Math.sqrt(q[0]*q[0]+q[1]*q[1]+q[2]*q[2]+q[3]*q[3]));
        return q;
        //return [cos_angle2,axis[0]*sin_angle2,axis[1]*sin_angle2,axis[2]*sin_angle2];
    },
    
    /// Used to convert a quaternion rotation into a 3x3 matrix
    convertMat3(quaternion){
        var q0 = quaternion[0];
        var q1 = quaternion[1];
        var q2 = quaternion[2];
        var q3 = quaternion[3];

        var row1 = [q0*q0+q1*q1-q2*q2-q3*q3, 2*q1*q2-2*q0*q3, 2*q1*q3+2*q0*q2];
        var row2 = [2*q1*q2+2*q0*q3, q0*q0-q1*q1+q2*q2-q3*q3, 2*q2*q3-2*q0*q1];
        var row3 = [2*q1*q3-2*q0*q2, 2*q2*q3+2*q0*q1, q0*q0-q1*q1-q2*q2+q3*q3];

        return [row1,row2,row3].flat();
    }


}





//// Other stuff

// Function to 'pretty print' matrices in the console. Useful for debugging
function pretty_print(array){
    var d = Math.sqrt(array.length);
    var temp = [];
    for (var n = 0; n<d; n++){
        temp.push(array[n].toFixed(2));
    }
    for (var n = 0; n<d; n++){
        console.log((temp.slice((d*n),(d*n+d))));
    }
}

function scale(matrix,s){
    for (num in matrix){
        matrix[num] *= s;
    }
    return matrix;
}

function transpose(matrix){
    const dim = Math.sqrt(matrix.length);
    const original = matrix;
    var temp  = new Float32Array(matrix.length);

    for (num in original){
        temp[num] = original[dim*(num%dim)+(~~(num/dim))];
        //console.log(dim*(num%dim)+(~~(num/dim)));
    }
    return temp;
}

/// Used to computer a rainbow color gradient from a parameter t.
function color_func(t){

    var r = Math.sin(t);
    var g = Math.sin(t+PI/4);
    var b = Math.sin(t+PI/2);

    return [r*r,g*g,b*b]
}