Emanuel Rollin - 20106951




hello

hum happy holidays and such

au besoin:

https://github.com/LipoBruh/IFT3355_TP3





## Interprétation personnelle du TP:

Le modèle de l'arbre (Tronc et Feuilles) est dicté par le squelette
Le squelette est (possiblement) généré aléatoirement
On anime l'arbre (ou le squelette) avec des forces (vent et gravité)



### Géométrie
- L'arbre (squelette?) peut être construit manuellement ???



### Modélisation
- On souhaite une géométrie en courbes qui génère une surface autour du squelette
- On veut une géométrie continue

#### a) Simplification du squelette (5 pts)

compléter TP3.Geometry.simplifySkeleton
  - Entrées : 
    - Noeud (racine) "rootNode"
    - Angle maximal de rotation "rotationThreshold"

  - Sorties : 
    - Noeud (racine) "rootNode" (avec enfants modifiés)

  - Utilité
      - Retire certains noeuds (nb enfants ==1 && angle<"rotationThreshold")


Structure de l'arbre:

Nodes :

  - Attributs : 
    - P0 et P1 qui sont les positions (Vector3?) de début et de fin d'une branche
      - Implique que les branches peuvent être discontinues? 
      -
  - Notes :
    - Pas d'attribut de rotation ou de matrice
    - findRotation(a,b) se sert  de 2 vecteurs pour trouver l'angle entre eux par rapport à un axe
    - si le vecteur a = P0 vers P1, alors l'angle avec le parent / ou l'enfant peut être trouvé 

```
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
}
```


#### b) Modélisation approximative (10 pts)


compléter TP3.Render.drawTreeRough
  - Entrées : 
    - Noeud (racine) "rootNode"
    - Scene du monde
    - alpha (valeur associée aux branches)
    - nombre de subdivisions "radialDivisions"
    - facteur de coupure "leavesCutoff"
    - nombre de feuilles "leavesDensity
    - matrice de transformation "matrix"

  - Utilité
      - Trace la géométrie autour de l'arbre


Branches:
- Cylindre (CylinderBufferGeometry)
  - Matériel -> THREE.MeshLambertMaterial({color: 0x8B5A2B})
  - Résolution du cercle : 8 vertices
  - Rayon top face : node.a1
  - Rayon bottom face : node.a0
  - Hauteur : Magnétude du vecteur (P1-P2)
  - Position : (P1+P0)/2

Feuilles:
- Qty : leavesDensity
- Plane : new THREE.PlaneBufferGeometry(alpha,alpha);
  - Alpha : dimensions du carré
  - Matériel : THREE.MeshPhongMaterial({color: 0x3A5F0B,side: THREE.DoubleSide})
  - Position : (P1+P0)/2
  - Rotation : aléatoire sur x,y,z



#### c) Courbes de Hermite (15 pts)

Complétez la fonction TP3.Geometry.hermite(h0, h1, v0, v1, t)
  - Entrées : 
    - Points "h0" et "h1"
    - Tangentes "v0" et "v1"
    - t de l'équation paramétrique


  - Sorties : 
    - Tableau constant [p , dp]
      - p = position 
      - dp = derivative 

  - Utilité
      - Trace la géométrie autour de l'arbre

PART 1 :

generateSegmentsHermite
Génère les points dans l'attribut section de chaque node correspondant aux vertices du cylindre composant le mesh de l'arbre.

drawTreeHermite
Utilise l'information générée dans l'attribut section pour la populer dans Three.BufferGeometry() et former le maillage avec le matériel approprié.




### Animation





## Code

### TODO:

- TP3_Geometry.js
  - simplifySkeleton
  - generateSEgmentsHermite
  - hermite

- TP3_Physics.js
  - applyForces

- TP3_Render.js
  - drawTreeRough
  - drawTreeHermite
  - updateTreeHermite


La librarie Javascript Three.js est disponible ainsi que ses fonctionnalités