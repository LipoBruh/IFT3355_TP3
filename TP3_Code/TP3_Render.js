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
			this.drawLeaves(rootNode,scene,alpha,leavesDensity)
		}
		else{
			this.drawBranch(rootNode,scene,radialDivisions)
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
		//rotate
		const up = new THREE.Vector3(0, 1, 0); 
		const rotationMatrix = new THREE.Matrix4();
		rotationMatrix.lookAt(node.generate_rotation_vector(), new THREE.Vector3(0, 0, 0), up);
		
		// Extract rotation as a quaternion
		const quaternion = new THREE.Quaternion();
		quaternion.setFromRotationMatrix(rotationMatrix);
		
		// Apply the quaternion to the cylinder
		plane.setRotationFromQuaternion(quaternion);
		plane.rotateX(3.14/2)
		plane.rotateY(Math.floor(Math.random() * 1.5))
		plane.rotateX(Math.floor(Math.random() * 1.5))
		plane.rotateZ(Math.floor(Math.random() * 1.5))
		//this.drawSphereAt(scene, node.get_middle())
	
		//
		scene.add(plane);
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
		
		// Extract rotation as a quaternion
		const quaternion = new THREE.Quaternion();
		quaternion.setFromRotationMatrix(rotationMatrix);
		
		// Apply the quaternion to the cylinder
		cylinder.setRotationFromQuaternion(quaternion);
		cylinder.rotateX(3.14/2)
		
		//this.drawSphereAt(scene, node.get_middle())
	
		//
		scene.add(cylinder);
	},

	drawSphereAt: function (scene, pos){

		const sphereGeometry = new THREE.SphereGeometry(0.05, 4, 4); // Radius 1.5, 32 width/height segments
		const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
		const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
		scene.add(sphere);
		sphere.position.set(pos.x, pos.y, pos.z); // Centered at the origin
	},
	drawTreeHermite: function (rootNode, scene, alpha, leavesCutoff = 0.1, leavesDensity = 10, applesProbability = 0.05, matrix = new THREE.Matrix4()) {
		//TODO
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