
class Node {
	constructor(parentNode) {
		this.parentNode = parentNode; //Noeud parent
		this.childNode = []; //Noeud enfants

		this.p0 = null; //Position de depart de la branche
		this.p1 = null; //Position finale de la branche

		this.a0 = null; //Rayon de la branche a p0
		this.a1 = null; //Rayon de la branche a p1

		this.sections = []; //Liste contenant une liste de points representant les segments circulaires du cylindre generalise
		this.centers = []
		//
		this.transform= new THREE.Matrix4().identity();
	}

	get_original_p0(){
		return this.p0.clone().applyMatrix4(this.transform.clone().getInverse(this.transform.clone()))
	}

	get_original_p1(){
		return this.p1.clone().applyMatrix4(this.transform.clone().getInverse(this.transform.clone()))
	}

	get_original_v1(){
		if(!this.parentNode){
			return new THREE.Vector3(0,0,0)
		}
		var vector = new THREE.Vector3()
		vector.subVectors( this.get_original_p1() ,this.get_original_p0() )
		return vector
	}

	get_original_angle_parent(){
		var v_parent = null
		if(!this.parentNode){
			v_parent = new THREE.Vector3(0,0,0)
		}
		else{
			v_parent = this.parentNode.get_original_v1()
		}
		return this.get_original_v1.angleTo(v_parent)
	}

	get_angle_parent(){
		var v_parent = null
		if(!this.parentNode){
			v_parent = new THREE.Vector3(0,0,0)
		}
		else{
			v_parent = this.parentNode.vector1()
		}
		return this.get_vector1().angleTo(v_parent)
	}

	


	generate_vector(){
		var vector = new THREE.Vector3()
		vector.subVectors( this.p1 , this.p0  )
		return vector
	}

	generate_vector2(){
		var vector = new THREE.Vector3()
		vector.subVectors( this.p0 ,this.p1 ).normalize();
		return vector
	}

	vector1(){
		if(!this.parentNode){
			return new THREE.Vector3(0,0,0)
		}
		var vector = new THREE.Vector3()
		vector.subVectors( this.parentNode.p1 ,this.parentNode.p0 )
		return vector
	}

	vector0(){
		if(!this.parentNode){
			return new THREE.Vector3(0,0,0)
		}
		var vector = new THREE.Vector3()
		vector.subVectors( this.parentNode.p1 ,this.parentNode.p0 )
		return vector
	}

	generate_vector_magnitude(){
		var vector = new THREE.Vector3()
		return vector.subVectors( this.p0 , this.p1  ).length();
	}


	generate_rotation_vector(){
		var vector = new THREE.Vector3()
		vector.subVectors( this.p1 , this.get_middle()  ).normalize();
		return vector
	}


	get_middle(){
		var vector = new THREE.Vector3()
		vector.addVectors( this.p0 , this.p1  ).divideScalar(2)
		return vector
	}

	get_interpolated_radius(t){
		if (t>1){
			return this.a1
		}
		if(t<0){
			return this.a0
		}
		return this.a0 - t*(this.a0-this.a1)
		
	}

	elasticForces () {
		return this.elasticForce(this.p1.clone().applyMatrix4(this.transform.clone().getInverse(this.transform.clone())),this.p1)
	}


	elasticForce (origin, now) {
		//
		var displacement = origin.clone().sub(now);
		var distance = displacement.length();
		var forceMagnitude = Math.pow(distance, 2);
		var force = displacement.normalize().multiplyScalar(forceMagnitude);
		//
		return force; // The force vector pointing towards the origin
	}
	

	applyForces() {
		const displacement = this.p1.clone().sub(this.p0);
		// rotation = vel vectimes displacement
		const rotationAxis = this.vel.clone().cross(displacement).normalize();
		const angle = this.vel.length();
		//console.log(angle)
	
		const rotationM4 = new THREE.Matrix4().makeRotationAxis(rotationAxis, angle);
		//console.log(rotationM4)
		//
		this.rotateP1AroundPoint(this.p0,rotationM4)
		// Apply the rotation to child nodes
		this.rotateChildren(this.p0, rotationM4);
	}
	

	rotateChildren(point,rotation){
		//
		this.childNode.forEach(child=>{
			child.rotateAllAroundPoint(point,rotation)
			})
		}
	
	rotateAllAroundPoint(point,rotation){
			// Translate a0 and a1 to the local coordinate space of `point`
			this.p0.sub(point);
			this.p1.sub(point);
		
			// Apply the rotation to a0 and a1
			this.p0.applyMatrix4(rotation);
			this.p1.applyMatrix4(rotation);
		
			// Translate the rotated vectors back to world space
			this.p0.add(point);
			this.p1.add(point);
			//
			//
			// Combine the transformations: translate to local, rotate, and back to world
			const newTransform = new THREE.Matrix4()
				.multiply( new THREE.Matrix4().makeTranslation(-point.x, -point.y, -point.z) )
				.multiply(rotation)
				.multiply( new THREE.Matrix4().makeTranslation(point.x, point.y, point.z) );
		
			this.transform.multiply(newTransform); // Apply the combined transformation
	}

	rotateP1AroundPoint(point,rotation){
		//
		this.p1.sub(point);
		this.p1.applyMatrix4(rotation);
		this.p1.add(point);
		//
		//
		// Combine the transformations: translate to local, rotate, and back to world
		const newTransform = new THREE.Matrix4()
			.multiply( new THREE.Matrix4().makeTranslation(-point.x, -point.y, -point.z) )
			.multiply(rotation)
			.multiply( new THREE.Matrix4().makeTranslation(point.x, point.y, point.z) );
	
		this.transform.multiply(newTransform); // Apply the combined transformation
}
		

}
	

	

TP3.Geometry = {
/* #### a) Simplification du squelette (5 pts)

compléter TP3.Geometry.simplifySkeleton
  - Entrées : 
    - Noeud (racine) "rootNode"
    - Angle maximal de rotation "rotationThreshold"

  - Sorties : 
    - Noeud (racine) "rootNode" (avec enfants modifiés)

  - Utilité
      - Retire certains noeuds (nb enfants ==1 && angle<"rotationThreshold") */


	simplifySkeleton: function (rootNode, rotationThreshold = 0.0001) {
		//simplifies the logic
		this.simplifySkeletonRercusive(rootNode,rotationThreshold)
		return rootNode
	},

	simplifySkeletonRercusive : function(node, rotationThreshold = 0.0001){
		
		if (node.childNode.length==1){
			//console.log("true")
			//
			child = node.childNode[0]
			angle =node.generate_vector().normalize().angleTo(child.generate_vector().normalize())
			//
			if(Math.abs(angle)<rotationThreshold){
				//modify current node
				node.childNode = child.childNode
				node.p1 = child.p1
				node.a1 = child.a1
				node.sections = [...node.sections, ...child.sections]
				//
				this.simplifySkeletonRercusive(node,rotationThreshold)
				return
			}
			this.simplifySkeletonRercusive(child,rotationThreshold) 
			return
		}
		else if(node.childNode.length==0){
			return
		}
		else{
			node.childNode.forEach((e)=>{
				this.simplifySkeletonRercusive(e,rotationThreshold)
				return
			})
		}
	},


	getRotationMatrix: function (vector) {
		var up = new THREE.Vector3(0, 1, 0); // Define the up vector
		var direction = vector.clone().normalize(); // Normalize the target direction vector
	
		// Create a quaternion that rotates from up to the target direction
		var quaternion = new THREE.Quaternion();
		quaternion.setFromUnitVectors(up, direction);
	
		// Create a 4x4 transformation matrix from the quaternion
		var rotationMatrix = new THREE.Matrix4();
		rotationMatrix.makeRotationFromQuaternion(quaternion);
	
		return rotationMatrix;
	},
	

	generateSectionPoints(position,qty,radius){
		//
		if (qty<3){ return null}
		points=[]
		//assuming y is up  = (0,1,0)
		//
		//let's pace n points equal to qty around the radius 
		for (var radian = 0; radian<6.30; radian+=6.30/qty){
			//calculate cos and sin
			var cosX = Math.cos(radian)*radius
			var sinZ = Math.sin(radian)*radius
			//
			point = new THREE.Vector3(position.x + cosX,position.y,position.z+sinZ)
			points.push(point)
		}
		return points
	},


	get_hermite_M: function(){
		matrix = new THREE.Matrix4()
		matrix.set(
			-1, 3,-3, 1,
			 3,-6, 3, 0,
			-3, 3, 0, 0,
			 1, 0, 0, 0
		);
		return matrix	
	},

	get_hermite_T2: function(){
		matrix = new THREE.Matrix4()
		matrix.set(
			 1, 0, 0, 0,
			 0, 0, 0, 1,
			-3, 3, 0, 0,
			 0, 0,-3, 3
		);
		return matrix	
	},

	get_hermite_T: function(t){
		vector = new THREE.Vector4()
		vector.set(t*t*t, t*t, t, 1)
		return vector
	},


	hermite_point_axis: function(t,vector){
		vector_T = this.get_hermite_T(t)
		matrix_M = this.get_hermite_M()
		iresult1 = vector.clone().applyMatrix4(matrix_M); //4x4 * 4x1 = 4x1 vector
		result = vector_T.clone().dot(iresult1)//1x4 * 4x1 = 1x1
		return result
	},

	hermite_point: function(h0, h1, v0, v1, t){
		vectorX = new THREE.Vector4(h0.x,h1.x,v0.x,v1.x)
		vectorY= new THREE.Vector4(h0.y,h1.y,v0.y,v1.y)
		vectorZ = new THREE.Vector4(h0.z,h1.z,v0.z,v1.z)
		point = new THREE.Vector3(this.hermite_point_axis(t,vectorX),this.hermite_point_axis(t,vectorY),this.hermite_point_axis(t,vectorZ))
		return point	
	},

	//https://math.stackexchange.com/questions/1270776/how-to-find-tangent-at-any-point-along-a-cubic-hermite-spline
	hermite_tangent_axis: function(t,vector){
		vector_deriv = new THREE.Vector4( (6*t*t -6*t), (-6*t*t +6*t), (3*t*t -4*t -1), (3*t*t -2*t))
		result = vector_deriv.clone().dot(vector)//1x4 * 4x1 = 1x1
		return result
	},

	hermite_tangent: function(h0, h1, v0, v1, t){
		vectorX = new THREE.Vector4(h0.x,h1.x,v0.x,v1.x)
		vectorY= new THREE.Vector4(h0.y,h1.y,v0.y,v1.y)
		vectorZ = new THREE.Vector4(h0.z,h1.z,v0.z,v1.z)
		tangent = new THREE.Vector3(this.hermite_tangent_axis(t,vectorX),this.hermite_tangent_axis(t,vectorY),this.hermite_tangent_axis(t,vectorZ))
		return tangent	
	},

	getTranslation: function(start, destination) {
		// 
		const translation = destination.clone().sub(start);
		//
		const translationMatrix = new THREE.Matrix4();
		translationMatrix.makeTranslation(translation.x, translation.y, translation.z);
	
		return translationMatrix;
	},
	



	generateSegmentsHermite: function (rootNode, lengthDivisions = 4, radialDivisions = 8) {
		rootNode.sections=[]

		if (!rootNode ){
			return
		}

		//for every division around the height, find the n points representing the vertices 
		for(var i = 0; i<=lengthDivisions;i++){
			//
			var t = i/lengthDivisions
			//console.log(t)
			var radius = rootNode.get_interpolated_radius(t)
			var points = []
			//
				//This part works
				var [position,tangente] = this.hermite_to_bezier(rootNode, t)
				//
				r4 = this.getRotationMatrix(tangente)
				t41 = this.getTranslation(position,new THREE.Vector3(0,0,0))
				t42= this.getTranslation(new THREE.Vector3(0,0,0),position)

				points = this.generateSectionPoints(position,radialDivisions,radius)
				points.forEach((e)=>{
					e.applyMatrix4(t41)
					e.applyMatrix4(r4)
					e.applyMatrix4(t42)

				})
			rootNode.centers.push(position)
			rootNode.sections.push(points)
		}


		rootNode.childNode.forEach(node => {
			
			this.generateSegmentsHermite(node, lengthDivisions, radialDivisions)
		});
	},

	




	hermite_node: function (node, t) {
		var h0 = node.parentNode.get_middle()
		var v0 = node.parentNode.generate_vector()
		var h1 = node.childNode[0].get_middle()
		var v1= node.childNode[0].generate_vector2()
		return this.hermite(h0,h1,v0,v1,t)
	},


	hermite: function (h0, h1, v0, v1, t) {
		//TODO
		point = this.hermite_point(h0, h1, v0, v1, t)
		tangent = this.hermite_tangent(h0, h1, v0, v1, t)
		return [point,tangent]
	},




	get_hermite_M_conversion: function(){
		matrix = new THREE.Matrix4()
		matrix.set(
			 3, 0, 0, 0,
			 3, 0, 1, 0,
			 0, 3, 0,-1,
			 0, 3, 0, 0
		);
		return matrix	
	},

	get_bezier_M: function(){
		matrix = new THREE.Matrix4()
		matrix.set(
			-1, 3,-3, 1,
			 3,-6, 3, 0,
			-3, 3, 0, 0,
			 1, 0, 0, 0
		);
		return matrix	
	},

	bezier_tangent : function(p0,p1,p2,p3,t){
		var p00 = p0.clone().multiplyScalar(-3*(1-t)*(1-t))
		var p11 = p1.clone().multiplyScalar(9*t*t -12*t +3)
		var p22 = p2.clone().multiplyScalar(6*t -9*t*t)
		var p33 = p3.clone().multiplyScalar(3*t*t)
		return p00.add(p11).add(p22).add(p33).normalize()
	},



	get_hermite_bezier_GM: function (vector){
		var m = this.get_hermite_M_conversion()
		var GM = vector.clone().applyMatrix4(m).multiplyScalar(1/3)
		return GM
	},

	get_bezier_points:function(h0,h1,v0,v1){
		var col1 = new THREE.Vector4(h0.x,h1.x,v0.x,v1.x)
		var col2 = new THREE.Vector4(h0.y,h1.y,v0.y,v1.y)
		var col3 = new THREE.Vector4(h0.z,h1.z,v0.z,v1.z)
		//
		var col11= this.get_hermite_bezier_GM(col1)
		var col22= this.get_hermite_bezier_GM(col2)
		var col33= this.get_hermite_bezier_GM(col3)
		//
		var p0 = new THREE.Vector3(col11.x,col22.x,col33.x)
		var p1 = new THREE.Vector3(col11.y,col22.y,col33.y)
		var p2 = new THREE.Vector3(col11.z,col22.z,col33.z)
		var p3 = new THREE.Vector3(col11.w,col22.w,col33.w)
		return [p0,p1,p2,p3]
	},

	get_bezier_GM: function (vector){
		var m = this.get_bezier_M()
		var GM = vector.clone().applyMatrix4(m).multiplyScalar(1/3)
		return GM
	},

	get_GM_rows:function(p0,p1,p2,p3){
		var col1 = new THREE.Vector4(p0.x,p1.x,p2.x,p3.x)
		var col2 = new THREE.Vector4(p0.y,p1.y,p2.y,p3.y)
		var col3 = new THREE.Vector4(p0.z,p1.z,p2.z,p3.z)
		//
		var col11= this.get_hermite_bezier_GM(col1)
		var col22= this.get_hermite_bezier_GM(col2)
		var col33= this.get_hermite_bezier_GM(col3)
		//
		var row0 = new THREE.Vector3(col11.x,col22.x,col33.x)
		var row1 = new THREE.Vector3(col11.y,col22.y,col33.y)
		var row2 = new THREE.Vector3(col11.z,col22.z,col33.z)
		var row3 = new THREE.Vector3(col11.w,col22.w,col33.w)
		return [row0,row1,row2,row3]
	},



	hermite_to_bezier: function (node, t) {
		//node.parentNode.get_middle()
		var h0 = node.p0
		//node.parentNode.generate_vector()
		var v0 = node.vector1()
		//node.childNode[0].get_middle()
		var h1 = node.p1
		//node.childNode[0].generate_vector2()
		var v1= node.generate_vector()
		//p0, p1, p2, p3
		var [p0,p1,p2,p3] = this.hermiteToBezier(h0,h1,v0,v1)

		return this.bezierPointAndTangent(p0,p1,p2,p3,t)
	},

	bezier: function (p0,p1,p2,p3,t){
		var T = this.get_hermite_T(t)
		//M * p0, p1, p2, p3
		var [row0,row1,row2,row3] = this.get_GM_rows(p0,p1,p2,p3)
		var col1 = new THREE.Vector4(row0.x,row1.x,row2.x,row3.x)
		var col2 = new THREE.Vector4(row0.y,row1.y,row2.y,row3.y)
		var col3 = new THREE.Vector4(row0.y,row1.y,row2.y,row3.y)

		var point = new THREE.Vector3(T.clone().dot(col1),T.clone().dot(col2),T.clone().dot(col3))
		var tangent = this.bezier_tangent(p0,p1,p2,p3,t)
		return [point,tangent]
	},


	bezierPointAndTangent:function(p0, p1, p2, p3, t) {
		// Ensure t is clamped between 0 and 1
		t = Math.max(0, Math.min(1, t));
	
		// Calculate the point on the cubic Bézier curve
		const point = new THREE.Vector3()
			.add(p0.clone().multiplyScalar((1 - t) ** 3))
			.add(p1.clone().multiplyScalar(3 * (1 - t) ** 2 * t))
			.add(p2.clone().multiplyScalar(3 * (1 - t) * t ** 2))
			.add(p3.clone().multiplyScalar(t ** 3));
	
		// Calculate the tangent (derivative of the cubic Bézier curve)
		const tangent = new THREE.Vector3()
			.add(p0.clone().multiplyScalar(-3 * (1 - t) ** 2))
			.add(p1.clone().multiplyScalar(9 * t ** 2 - 12 * t + 3))
			.add(p2.clone().multiplyScalar(6 * t - 9 * t ** 2))
			.add(p3.clone().multiplyScalar(3 * t ** 2))
			.normalize(); // Normalize to ensure it's a unit vector
	
		return [point, tangent];
	},


	hermiteToBezier:function(h0, h1, v0, v1) {
		// Hermite start and end points
		const bezierP0 = h0.clone(); // Same as Hermite P0
		const bezierP3 = h1.clone(); // Same as Hermite P1
		//more comprehensible than apply.m4 * 1/3
		const bezierP1 = h0.clone().add(v0.clone().multiplyScalar(1 / 3)); 
		const bezierP2 = h1.clone().sub(v1.clone().multiplyScalar(1 / 3)); 
		//
		return [bezierP0, bezierP1, bezierP2, bezierP3];
	},
	


	// Trouver l'axe et l'angle de rotation entre deux vecteurs
	findRotation: function (a, b) {
		const axis = new THREE.Vector3().crossVectors(a, b).normalize();
		var c = a.dot(b) / (a.length() * b.length());

		if (c < -1) {
			c = -1;
		} else if (c > 1) {
			c = 1;
		}

		const angle = Math.acos(c);

		return [axis, angle];
	},

	// Projeter un vecter a sur b
	project: function (a, b) {
		return b.clone().multiplyScalar(a.dot(b) / (b.lengthSq()));
	},

	// Trouver le vecteur moyen d'une liste de vecteurs
	meanPoint: function (points) {
		var mp = new THREE.Vector3();

		for (var i = 0; i < points.length; i++) {
			mp.add(points[i]);
		}

		return mp.divideScalar(points.length);
	},
};