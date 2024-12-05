
class Node {
	constructor(parentNode) {
		this.parentNode = parentNode; //Noeud parent
		this.childNode = []; //Noeud enfants

		this.p0 = null; //Position de depart de la branche
		this.p1 = null; //Position finale de la branche

		this.a0 = null; //Rayon de la branche a p0
		this.a1 = null; //Rayon de la branche a p1

		this.sections = null; //Liste contenant une liste de points representant les segments circulaires du cylindre generalise
	}

	generate_vector(){
		var vector = new THREE.Vector3()
		vector.subVectors( this.p0 , this.p1  ).normalize();
		return vector
	}

	generate_vector_magnitude(){
		var vector = new THREE.Vector3()
		return vector.subVectors( this.p0 , this.p1  ).length();
	}

	get_middle(){
		var vector = new THREE.Vector3()
		vector.subVectors( this.p0 , this.p1  ).divideScalar(2).multiplyScalar(1)
		vector.y+=1
		return vector
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
		simplifySkeletonRercusive(rootNode,rotationThreshold)
		return rootNode
	},

	simplifySkeletonRercusive : function(node, rotationThreshold = 0.0001){
		if (node.childNode.length==1){
			//
			child = rootNode.childNode[0]
			angle = this.findRotation(node.generate_vector(), child.generate_vector())
			//
			if(Math.abs(angle)<rotationThreshold){
				//modify current node
				node.childNode = child.childNode
				node.p1 = child.p1
				node.a1 = child.a1
				node.sections.append(child.sections)
				//
				simplifySkeletonRercusive(node,rotationThreshold)
				return
			}
			simplifySkeletonRercusive(child,rotationThreshold) 
			return
		}
		else if(node.childNode.length==0){
			return
		}
		else{
			node.childNode.forEach((e)=>{
				simplifySkeletonRercusive(e,rotationThreshold)
				return
			})
		}
	},


	generateSegmentsHermite: function (rootNode, lengthDivisions = 4, radialDivisions = 8) {
		//TODO
	},

	hermite: function (h0, h1, v0, v1, t) {
		//TODO
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