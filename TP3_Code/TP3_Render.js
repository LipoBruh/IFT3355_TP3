/* TP3.Data = {
	SmallTree: {
		theta: 0.3142,
		alpha: 0.2,
		decay: 0.88,
		iters: 8,
		str: "BBBBBA",
		dict: {
			"A": { "default": "[++BB[--C][++C][__C][^^C]A]/////+BBB[--C][++C][__C][^^C]A" },
			"B": {
				"default": "\\B",
				"prob": [0.5, 0.5],
				"val": ["B", "\\\\B"]
			},
			"C": { "default": "" }
		}
	} */


TP3.Render = {
	drawTreeRough: function (rootNode, scene, alpha, radialDivisions = 8, leavesCutoff = 0.1, leavesDensity = 10, applesProbability = 0.05, matrix = new THREE.Matrix4()) {
		//TODO
		//CylinderBufferGeometry
		//PlaneBufferGeometry
		//THREE.BufferGeometryUtils.mergeBufferGeometries
		if (rootNode.childNode.length == 0){
			this.drawBranch(rootNode,scene)
			this.drawAppleProbability(rootNode,scene,alpha,applesProbability,leavesCutoff)
			this.drawLeaves(rootNode,scene,alpha,leavesDensity)
		}
		else{
			this.drawBranch(rootNode,scene,radialDivisions)
			this.drawAppleProbability(rootNode,scene,alpha,applesProbability,leavesCutoff)
			if(rootNode.a0  < alpha*leavesCutoff){
				this.drawLeaves(rootNode,scene,alpha,leavesDensity)
			}
			//
			rootNode.childNode.forEach(element => {
				//
				this.drawTreeRough(element,scene,alpha,radialDivisions,leavesCutoff,leavesDensity,applesProbability,matrix)
				
			});
		}
		

	},
	drawLeaves: function (node, scene,alpha,leavesDensity) {
		for (var i=0; i<leavesDensity;i++){
			this.drawLeaf(node,scene,alpha)
		}

	},

	drawLeaf: function (node, scene,alpha) {
		const geometry = new THREE.PlaneBufferGeometry(alpha,alpha);
		const material = new THREE.MeshPhongMaterial({color: 0x3A5F0B,side: THREE.DoubleSide})
		const plane = new THREE.Mesh(geometry, material );
		//translate
		plane.position.copy(node.p1)
		//
		var pm1 = Math.random() < 0.5 ? -1 : 1;
		var pm2 = Math.random() < 0.5 ? -1 : 1;
		var pm3 = Math.random() < 0.5 ? -1 : 1;
		//
		plane.translateX(pm1*Math.random() * alpha/2)
		plane.translateY(pm2*Math.random() * alpha/2)
		plane.translateZ(pm3*Math.random() * alpha/2)
		//rotate
		plane.rotateY(Math.floor(Math.random() * 6.28))
		plane.rotateX(Math.floor(Math.random() * 6.28))
		plane.rotateZ(Math.floor(Math.random() * 6.28))
	
	
		//
		scene.add(plane);
	},

	drawAppleProbability: function (node, scene, alpha,applesProbability,leavesCutoff) {
		if (applesProbability>Math.random() && node.a0<leavesCutoff*alpha){
			this.drawApple(node,scene,alpha)
		}
	},

	drawApple: function (node, scene, alpha) {
		const geometry = new THREE.BoxGeometry(alpha,alpha,alpha);
		const material = new THREE.MeshPhongMaterial({color: 0x5F0B0B}) 
		const cube = new THREE.Mesh(geometry, material );
		//translate
		cube.position.copy(node.get_middle())
		cube.translateY(-alpha*0.75)
		//
		cube.rotateY(Math.floor(Math.random() * 1.5))
		//cube.rotateX(Math.floor(Math.random() * 1.5))
		//cube.rotateZ(Math.floor(Math.random() * 1.5))
		//
		scene.add(cube)
	},

	

	drawBranch: function (node, scene, radialDivisions) {
		const geometry = new THREE.CylinderBufferGeometry(node.a1, node.a0, node.generate_vector_magnitude(), radialDivisions, 1, false);
		const material = new THREE.MeshLambertMaterial({color: 0x8B5A2B});
		const cylinder = new THREE.Mesh(geometry, material );
		//translate
		cylinder.position.copy(node.get_middle())
		//rotate
		const up = new THREE.Vector3(0, 1, 0); 
		const rotationMatrix = new THREE.Matrix4();
		rotationMatrix.lookAt(node.generate_rotation_vector(), new THREE.Vector3(0, 0, 0), up);
		
		// Extract rotation as a quaternionn
		const quaternion = new THREE.Quaternion();
		quaternion.setFromRotationMatrix(rotationMatrix);
		
		// Apply the quaternion to the cylinder
		cylinder.setRotationFromQuaternion(quaternion);
		cylinder.rotateX(3.14/2)
		

	
		//
		scene.add(cylinder);
	},

	drawSphereAt: function (scene, pos,i){

		const sphereGeometry = new THREE.SphereGeometry(0.05, 4, 4); // Radius 1.5, 32 width/height segments
		const sphereMaterial = new THREE.MeshBasicMaterial({ color: `rgb(0,0,${i*6})` }); // Red color
		const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
		scene.add(sphere);
		sphere.position.set(pos.x, pos.y, pos.z); // Centered at the origin
	},
	
	drawTreeHermite: function (rootNode, scene, alpha, leavesCutoff = 0.1, leavesDensity = 10, applesProbability = 0.05, matrix = new THREE.Matrix4()) {
		if (!rootNode){
			return
		}
		if(rootNode.sections.length==0 && !rootNode.parentNode){
			TP3.Geometry.generateSegmentsHermite(rootNode,4,8)
		}
		//branches - init buffer
		var geometry = new THREE.BufferGeometry();
		geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array([]), 3));
		geometry.setIndex(new THREE.BufferAttribute(new Uint32Array([]), 1));
		// recursively populate the buffer
		this.drawTreeHermiteRecursive(geometry, 0, rootNode, scene, alpha, leavesCutoff, leavesDensity, applesProbability, matrix)
		this.updateBufferPoints(geometry,this.tris_points)
		this.updateBufferFaces(geometry,this.tris_list)
		geometry.computeVertexNormals();
		//render the buffer
		const material = new THREE.MeshLambertMaterial({color: 0x8B5A2B,side: THREE.DoubleSide});
		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);
		//
		//leaves - init buffer
		var leaf_geometry = new THREE.BufferGeometry();
		leaf_geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array([]), 3));
		leaf_geometry.setIndex(new THREE.BufferAttribute(new Uint32Array([]), 1));
		//recursively populate buffer
		this.drawTreeRough2(rootNode,scene,alpha,leavesCutoff,leavesDensity,applesProbability,matrix)
		this.updateBufferPoints(leaf_geometry,this.leaf_points)
		this.updateBufferFaces(leaf_geometry,this.leaf_indexes)
		leaf_geometry.computeVertexNormals();
		//render the buffer
		const material2 = new THREE.MeshPhongMaterial({color: 0x3A5F0B,side: THREE.DoubleSide})
		const mesh2 = new THREE.Mesh(leaf_geometry, material2);
		scene.add(mesh2);
		//
		
	},

	tris_points : [] = [],

	drawTreeHermiteRecursive:function(bufferGeometry, index, node, scene, alpha, leavesCutoff, leavesDensity, applesProbability, matrix){
		var index_now = index
		var index_list=[] //fixed
		//
		for(var sec = 0; sec<node.sections.length;sec++){
				var p_index_list=index_list
				index_list=[]
				//
				// get vertices & corresponding indexes
				node.sections[sec].forEach((v3)=>{
					//
					this.tris_points.push(v3.x,v3.y,v3.z);
					index_list.push(index_now)
					index_now++
					
				})
				//
				// Fill faces algos using the indexes of the vertices
				//
				if (sec==0){
					if(!node.parentNode){
						this.fill_bottom_ngon(index_list)
					}
					else{
						//maybe logic to connect with parent 
					}
				}
				else if(sec ==node.sections.length-1 && node.childNode.length==0){
					this.fill_top_ngon(index_list)
				}
				if(index_list.length>0 && p_index_list.length>0){
					this.fill_cylinder_ngon(index_list,p_index_list)
				}

			}
			//
			//
			// Return
			var child_index = index_now
			if(node.childNode.length==0){
				return index_now
			}
			else if(node.childNode.length==1){
				return this.drawTreeHermiteRecursive(bufferGeometry,index_now,node.childNode[0],scene,alpha,leavesCutoff,leavesDensity,applesProbability,matrix)
			}
			else{
				node.childNode.forEach((child)=>{
					child_index = this.drawTreeHermiteRecursive(bufferGeometry,child_index,child,scene,alpha,leavesCutoff,leavesDensity,applesProbability,matrix)
				})
				return child_index
			}
			
	},

	
	drawAppleProbability2: function (node, scene, alpha,applesProbability,leavesCutoff) {
		if (applesProbability>Math.random() && node.a0<leavesCutoff*alpha){
			this.drawApple2(node,scene,alpha)
		}
	},

	drawApple2: function (node, scene, alpha) {
		const material = new THREE.MeshPhongMaterial({color: 0x5F0B0B}) 
		const sphereGeometry = new THREE.SphereGeometry(alpha, 4, 4); // Radius 1.5, 32 width/height segments
		const sphere = new THREE.Mesh(sphereGeometry, material);
		//transforms 1. translate
		sphere.position.copy(node.get_middle())
		sphere.translateY(-alpha*0.75)
		// 2. rotate for style
		sphere.rotateY(Math.floor(Math.random() * 1.5))
		//add to scene
		scene.add(sphere);
	},


	drawTreeRough2: function (rootNode, scene, alpha, leavesCutoff = 0.1, leavesDensity = 10, applesProbability = 0.05, matrix = new THREE.Matrix4()) {
		//TODO
		//CylinderBufferGeometry
		//PlaneBufferGeometry
		//THREE.BufferGeometryUtils.mergeBufferGeometries
		if (rootNode.childNode.length == 0){
			this.drawAppleProbability2(rootNode,scene,alpha,applesProbability,leavesCutoff)
			this.drawLeaves2(rootNode,alpha,leavesDensity)
		}
		else{
			this.drawAppleProbability2(rootNode,scene,alpha,applesProbability,leavesCutoff)
			if(rootNode.a0  < alpha*leavesCutoff){
				this.drawLeaves2(rootNode,alpha,leavesDensity)
			}
			//
			rootNode.childNode.forEach(element => {
				//
				this.drawTreeRough2(element,scene,alpha,leavesCutoff,leavesDensity,applesProbability,matrix)
				
			});
		}
		

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


	drawLeaves2: function (node,alpha,leavesDensity) {
		for (var i=0; i<leavesDensity;i++){
			this.drawLeaf2(node,alpha)
		}

	},

	leaf_indexes:[] = [],
	leaf_points:[] = [],

	drawLeaf2: function (node,alpha) {
		//
		var middle = node.get_middle();
		var middleN = middle.clone().multiplyScalar(-1);
		var points = this.generateSectionPoints(middle,3,alpha)
		if (points.length!=3){
			return
		}
		points.forEach(v3=>{
			//randoms
			var pm1 = Math.random() < 0.5 ? -1 : 1;
			var pm2 = Math.random() < 0.5 ? -1 : 1;
			var pm3 = Math.random() < 0.5 ? -1 : 1;
			var translation = new THREE.Vector3(middle.x + pm1*Math.random() * alpha/2, middle.y + pm2*Math.random() * alpha/2, middle.z + pm3*Math.random() * alpha/2)
			//
			//translate to world origin
			//
			v3.add(middleN)
			//rotate
			this.applyRandomRotation(v3)
			v3.add(translation)
		})
		//
		//
		points.forEach(pt=>{
			this.leaf_points.push(pt.x)
			this.leaf_points.push(pt.y)
			this.leaf_points.push(pt.z)
			this.leaf_indexes.push(this.leaf_indexes.length)

		})
		return
	},


	applyRandomRotation:function(vector) {
			// Create a random quaternion representing the rotation
			const randomQuaternion = new THREE.Quaternion();
		
			// Generate random rotation angles in radians
			const randomX = Math.random() * Math.PI * 2; // Random angle between 0 and 2π
			const randomY = Math.random() * Math.PI * 2;
			const randomZ = Math.random() * Math.PI * 2;
		
			// Set the quaternion from Euler angles
			randomQuaternion.setFromEuler(new THREE.Euler(randomX, randomY, randomZ));
		
			// Apply the quaternion rotation to the vector directly
			vector.applyQuaternion(randomQuaternion);
		},
		
	


	drawAppleProbability: function (node, scene, alpha,applesProbability,leavesCutoff) {
		if (applesProbability>Math.random() && node.a0<leavesCutoff*alpha){
			this.drawApple(node,scene,alpha)
		}
	},




	fill_bottom_ngon:function(index_list){
		//
		faces = this.fill_ngon(index_list)
		return
	},

	fill_top_ngon:function(index_list){
		//
		faces = this.fill_ngon(index_list.reverse())
		return
	},

	fill_cylinder_ngon : function(index_self, index_parent){
		if(index_self.length!=index_parent.length){
			return
		}
		//
		for(var i = 0; i<index_self.length; i++){
			i_1 = (i+1)%index_self.length
			//change the order for fill_ngon to work
			index_list = [index_parent[i],index_parent[i_1],index_self[i_1],index_self[i]]
			this.fill_ngon(index_list)
		}
		return
	},
	
	fill_ngon:function(index_list){
		if(index_list.length<3){
			return
		}
		if(index_list.length==3){
			this.fill_tris(index_list)
			return 
		}
		else{
			var impairs = []
			var tris = []
			//
			for(var i = 0; i<=index_list.length; i++ ){
				//
				index = i%index_list.length
				tris.push(index_list[index])
				//
				if (tris.length==3){
					this.fill_tris(tris)
					tris = [index_list[index]]
				}
				if (i%2==0 && index_list[i]!=impairs[0]){ //on ajoute tous les indexs impairs sans dupliquer le 1er
					impairs.push(index_list[i])
				}
			}
			//on remplit la face centrale au besoin
			this.fill_ngon(impairs)
		}

	},

	tris_list : [] = [],

	fill_tris:function(index_list){
		if(index_list.length==3){
			if(index_list[2] == undefined){
				return
			}
			index_list.forEach(e=>{
				this.tris_list.push(e)
			})

		}
	},

	updateBufferFaces(bufferGeometry,index_list){
		const newIndexList = new Uint32Array(index_list);
		const currentIndexArray = bufferGeometry.getIndex().array;

		const concatenatedIndices = new Uint32Array(currentIndexArray.length + index_list.length);
		concatenatedIndices.set(currentIndexArray, 0);
		concatenatedIndices.set(newIndexList, currentIndexArray.length);
		
		bufferGeometry.setIndex(new THREE.BufferAttribute(concatenatedIndices, 1));
	},

	updateBufferPoints(bufferGeometry,vertices){
		const newF32Vertices = new Float32Array(vertices);
		const existingVertices = bufferGeometry.attributes.position.array;
		const concatenated = new Float32Array(newF32Vertices.length + existingVertices.length);
		concatenated.set(existingVertices, 0);
		concatenated.set(newF32Vertices, existingVertices.length);
		bufferGeometry.setAttribute("position", new THREE.BufferAttribute(concatenated, 3));
	},



	updateTreeHermite: function (trunkGeometryBuffer, leavesGeometryBuffer, applesGeometryBuffer, rootNode) {
		//TODO
	},

	drawTreeSkeleton: function (rootNode, scene, color = 0xffffff, matrix = new THREE.Matrix4()) {

		var stack = [];
		stack.push(rootNode);

		var points = [];

		while (stack.length > 0) {
			var currentNode = stack.pop();

			for (var i = 0; i < currentNode.childNode.length; i++) {
				stack.push(currentNode.childNode[i]);
			}

			points.push(currentNode.p0);
			points.push(currentNode.p1);

		}

		var geometry = new THREE.BufferGeometry().setFromPoints(points);
		var material = new THREE.LineBasicMaterial({ color: color });
		var line = new THREE.LineSegments(geometry, material);
		line.applyMatrix4(matrix);
		scene.add(line);

		return line.geometry;
	},

	updateTreeSkeleton: function (geometryBuffer, rootNode) {

		var stack = [];
		stack.push(rootNode);

		var idx = 0;
		while (stack.length > 0) {
			var currentNode = stack.pop();

			for (var i = 0; i < currentNode.childNode.length; i++) {
				stack.push(currentNode.childNode[i]);
			}
			geometryBuffer[idx * 6] = currentNode.p0.x;
			geometryBuffer[idx * 6 + 1] = currentNode.p0.y;
			geometryBuffer[idx * 6 + 2] = currentNode.p0.z;
			geometryBuffer[idx * 6 + 3] = currentNode.p1.x;
			geometryBuffer[idx * 6 + 4] = currentNode.p1.y;
			geometryBuffer[idx * 6 + 5] = currentNode.p1.z;

			idx++;
		}
	},


	drawTreeNodes: function (rootNode, scene, color = 0x00ff00, size = 0.05, matrix = new THREE.Matrix4()) {

		var stack = [];
		stack.push(rootNode);

		var points = [];

		while (stack.length > 0) {
			var currentNode = stack.pop();

			for (var i = 0; i < currentNode.childNode.length; i++) {
				stack.push(currentNode.childNode[i]);
			}

			points.push(currentNode.p0);
			points.push(currentNode.p1);

		}

		var geometry = new THREE.BufferGeometry().setFromPoints(points);
		var material = new THREE.PointsMaterial({ color: color, size: size });
		var points = new THREE.Points(geometry, material);
		points.applyMatrix4(matrix);
		scene.add(points);

	},


	drawTreeSegments: function (rootNode, scene, lineColor = 0xff0000, segmentColor = 0xffffff, orientationColor = 0x00ff00, matrix = new THREE.Matrix4()) {

		var stack = [];
		stack.push(rootNode);

		var points = [];
		var pointsS = [];
		var pointsT = [];

		while (stack.length > 0) {
			var currentNode = stack.pop();

			for (var i = 0; i < currentNode.childNode.length; i++) {
				stack.push(currentNode.childNode[i]);
			}

			const segments = currentNode.sections;
			for (var i = 0; i < segments.length - 1; i++) {
				points.push(TP3.Geometry.meanPoint(segments[i]));
				points.push(TP3.Geometry.meanPoint(segments[i + 1]));
			}
			for (var i = 0; i < segments.length; i++) {
				pointsT.push(TP3.Geometry.meanPoint(segments[i]));
				pointsT.push(segments[i][0]);
			}

			for (var i = 0; i < segments.length; i++) {

				for (var j = 0; j < segments[i].length - 1; j++) {
					pointsS.push(segments[i][j]);
					pointsS.push(segments[i][j + 1]);
				}
				pointsS.push(segments[i][0]);
				pointsS.push(segments[i][segments[i].length - 1]);
			}
		}

		var geometry = new THREE.BufferGeometry().setFromPoints(points);
		var geometryS = new THREE.BufferGeometry().setFromPoints(pointsS);
		var geometryT = new THREE.BufferGeometry().setFromPoints(pointsT);

		var material = new THREE.LineBasicMaterial({ color: lineColor });
		var materialS = new THREE.LineBasicMaterial({ color: segmentColor });
		var materialT = new THREE.LineBasicMaterial({ color: orientationColor });

		var line = new THREE.LineSegments(geometry, material);
		var lineS = new THREE.LineSegments(geometryS, materialS);
		var lineT = new THREE.LineSegments(geometryT, materialT);

		line.applyMatrix4(matrix);
		lineS.applyMatrix4(matrix);
		lineT.applyMatrix4(matrix);

		scene.add(line);
		scene.add(lineS);
		scene.add(lineT);

	}
}