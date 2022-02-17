//// Custom header thing for the math stuff I need in my projects... This is all done in pure javascript - no libraries used for now (except regular ol' js Math)

//// General structure / overview...
    
    /// Matrices:
        // 2x2, 3x3, 4x4 matrix math has been implemented to a limited degree. 
        // Each matrix type is defined as a set of functions that operate on a Float32Array - allowing for one to directly manipulate elements easily.
        // Matrices are indexed using the row-major format

    //// Vectors:
        // Relates heavily to the matrix math...
        // Also defined as arrays.
        // idk
        
    //// Differential equations:
        // Nothing at the moment.
    


/// PERSONAL NOTES & To-do list:
    
    // Implement faster inverse algorithms...
    // Better error detection / define the interaction between types
    // Finish the matrix math, but don't bother reinventing the wheel... add the more useful & less common functions
    // Possible use of complex numbers...
    // Derivative calculations & numerical integration?
    




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
        const compx_angle = vec3.angle(normalized_axis,[1,0,0]);
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
        
    },

    rotateN2: function(theta,axis=[1,0,0]){
        let omc = 1-Math.cos(theta);
        let ct = Math.cos(theta);
        let st = Math.sin(theta);
        let Rx = axis[0];
        let Ry = axis[1];
        let Rz = axis[2];

        let temp = new Float32Array(9);

        temp[0] = ct + Rx*Rx*omc;
        temp[1] = Rx*Ry*omc - Rz*st;
        temp[2] = Rx*Rz*omc + Ry*st;
        temp[3] = Ry*Rx*omc + Rz*st;
        temp[4] = ct + Ry*Ry*omc;
        temp[5] = Ry*Rz*omc - Rx*st;
        temp[6] = Rz*Rx*omc - Ry*st;
        temp[7] = Rz*Ry*omc + Rx*st;
        temp[8] = ct + Rz*Rz*omc;

        //console.log(temp)
        return temp;
    },

    mul: function(matrixA,vectorB){
        let v1 = vectorB;
        let m = matrixA;
        let v2 = [0,0,0];
        //v2[0] = v1[0]*m[0]+v1[0]*m[1]+v1[0]*m[2];
        //v2[1] = v1[1]*m[3]+v1[1]*m[4]+v1[1]*m[5];
        //v2[2] = v1[2]*m[6]+v1[2]*m[7]+v1[2]*m[8];
        
        v2[0] = v1[0]*m[0]+v1[1]*m[1]+v1[2]*m[2];
        v2[1] = v1[0]*m[3]+v1[1]*m[4]+v1[2]*m[5];
        v2[2] = v1[0]*m[6]+v1[1]*m[7]+v1[2]*m[8];
        return v2
    }
}


//// gonnna need a 4x4 Matrix & operations.
//// Probably gonna be more detailed than 3x3 stuff... probably cause it's more useful for camera stuff too idk.

var mat4 = {
    //// This one becomes incredibly specific to WebGL rather than general operations.

    create: function (identity=true,array = new Float32Array(16)){
        for (var n = 0; n<16; n++){
            if (n%5==0 && identity==true){array[n] = 1;}
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

    // Multiply 4x4 matrix with 4x1 vector
    mul: function (matrixA,vectorB){
        let v1 = vectorB;
        let m = matrixA;
        let v2 = [0,0,0,0];
        v2[0] = v1[0]*m[0]+v1[1]*m[1]+v1[2]*m[2]+v1[3]*m[3];
        v2[1] = v1[0]*m[4]+v1[1]*m[5]+v1[2]*m[6]+v1[3]*m[7];
        v2[2] = v1[0]*m[8]+v1[1]*m[9]+v1[2]*m[10]+v1[3]*m[11];
        v2[3] = v1[0]*m[12]+v1[1]*m[13]+v1[2]*m[14]+v1[3]*m[15];
        //console.log(v2);
        return v2;
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
        //console.log(temp);
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

    },


}


var gmat4 = {
    /// The following functions are defined for the construction of a rotation, scale, & translation matrix in one.
    /// Thus, the following operations are defined only for the use in a 3d coordinate system... i.e. placing 3x3 matrices in the 4x4 matrix
    /// Also mainly used for WebGL math
    /// Used to obtain & edit the specific section in the 4x4 matrix. i.e. rotate the inner 3x3
    get_sub_element: function(insert_matrix,id=0){
        let temp3 = mat4.create();

        const index_3x3 = [0,1,2,4,5,6,8,9,10];
        const index_translation = [3,7,11];
        const index_scale = [0,5,10];


        if (id==0){
            for (element in insert_matrix){
                temp3[(index_3x3[element])] = insert_matrix[element];
            }
        }

        if (id==1){
            for (element in insert_matrix){
                temp3[index_translation[element]] += insert_matrix[element];
            }
        }

        if (id==2){
            for (element in insert_matrix){
                temp3[index_scale[element]] *= insert_matrix[element];
            }
        }
        return temp3;
    },

    /// Rotate the compound matrix in 3-space
    rotate: function(matrix,angle,axis=[1,0,0]){
        let mat11 = mat3.create();
        let mat22 = mat3.rotateN2(angle,axis);
        let mat33 = gmat4.get_sub_element(mat22);
        //console.log(mat33);
        //return mat4.create();
        return mat4.dot(matrix,mat33);
    },
    scale: function(matrix,scaled=[1,1,1]){
        let mat11 = mat3.create();
        let mat33 = gmat4.get_sub_element(scaled,id=2);
        //console.log(mat33);
        //return mat4.create();
        return mat4.dot(matrix,mat33);
    },
    translate: function(matrix,translation=[0,0,0]){
        let mat11 = mat3.create();
        let mat33 = gmat4.get_sub_element(translation,id=1);
        //console.log(mat33);
        //return mat4.create();
        return mat4.dot(matrix,mat33);
    },

    translate2: function(matrix,translation=[0,0,0]){
        let mat11 = matrix;
        mat11[3] = translation[0];
        mat11[7] = translation[1];
        mat11[11] = translation[2];
        //let mat33 = gmat4.get_sub_element(translation,id=1,matrix);
        //console.log(mat33);
        //return mat4.create();
        return mat11;
    },


    rotate2: function(matrix,angle,axis){
        let mat11 = matrix;
        let mat22 = mat3.rotateN2(angle,axis);
        let newish = mat4.dot(mat11,mat22);
        
        mat11[0] = newish[0];
        mat11[1] = newish[1];
        mat11[2] = newish[2];
        mat11[4] = newish[3];
        mat11[5] = newish[4];
        mat11[6] = newish[5];
        mat11[8] = newish[6];
        mat11[9] = newish[7];
        mat11[10] = newish[8];
        
        return mat11;

    },

    fromPosRot: function(pos,rot){
        let temp = mat4.create();
        temp[0] = rot[0];
        temp[1] = rot[1];
        temp[2] = rot[2];
        temp[4] = rot[3];
        temp[5] = rot[4];
        temp[6] = rot[5];
        temp[8] = rot[6];
        temp[9] = rot[7];
        temp[10] = rot[8];

        temp[3] = pos[0];
        temp[7] = pos[1];
        temp[11] = pos[2];

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

/// Used to compute a rainbow color gradient from a parameter t.
function color_func(t){
    var r = Math.sin(t);
    var g = Math.sin(t+PI/4);
    var b = Math.sin(t+PI/2);
    return [r*r,g*g,b*b];
}




function persepective(fov,near,far,aspect){
    let projection = mat4.create(identity=false);
    let tana2 = Math.tan(PI/180*fov/2);
    let atan2 = Math.atan(fov/2);
    let aspect_ratio = 1.0;

    projection[0] = 1/(aspect*tana2);
    projection[5] = 1/(tana2);
    projection[10] = -(-far)/(far-near);
    projection[11] = (-far*near)/(far-near);
    projection[14] = 1.0;
    
    //projection[10] = -(far)/(far-near);
    //projection[11] = 1.0;
    //projection[14] = -(far*near)/(far-near);
    projection[15] = 0;

    return projection;
}