//////////////////////////////////////////////////////////////////////////////
//
//  For instantiating the scene models.
//
//  Based on a similar file provided by J. MadeiraJ. Madeira in Visual Computing classes
//
//////////////////////////////////////////////////////////////////////////////

//----------------------------------------------------------------------------
//
//  Constructors
//

// EMPTY MODEL
function emptyModelFeatures() {
	this.vertices = [];
	this.normals = [];

	// Transformation parameters

	// Displacement vector
	this.tx = 0.0;
	this.ty = 0.0;
	this.tz = 0.0;

	// Scaling factors
	this.sx = 1.0;
	this.sy = 1.0;
	this.sz = 1.0;

	// Rotation angles (unused)
	this.rotAngleXX = 0.0;
	this.rotAngleYY = 0.0;
	this.rotAngleZZ = 0.0;

	// Animation controls (unused)
	this.rotXXOn = false;
	this.rotYYOn = false;
	this.rotZZOn = false;
	this.rotXXSpeed = 1.0;
	this.rotYYSpeed = 1.0;
	this.rotZZSpeed = 1.0;
	this.rotXXDir = 1;
	this.rotYYDir = 1;
	this.rotZZDir = 1;
	
	// Material features
	// (default: brown color)
	this.kAmbi = [ 0.3, 0.15, 0.0 ];
	this.kDiff = [ 0.6, 0.3, 0.0 ];
	this.kSpec = [ 0.3, 0.15, 0.0 ];
	this.nPhong = 100;
}

// (unused)
function singleTriangleModel( ) {
	
	var triangle = new emptyModelFeatures();
	// Default model has just ONE TRIANGLE

	triangle.vertices = [
		// FRONTAL TRIANGLE
		-0.5, -0.5,  0.5,
		 0.5, -0.5,  0.5,
		 0.5,  0.5,  0.5,
	];

	triangle.normals = [
		// FRONTAL TRIANGLE
		 0.0,  0.0,  1.0,
		 0.0,  0.0,  1.0,
		 0.0,  0.0,  1.0,
	];

	return triangle;
}

function simpleCubeModel( ) {
	
	var cube = new emptyModelFeatures();
	
	cube.vertices = [
		-1.000000, -1.000000,  1.000000,
		 1.000000,  1.000000,  1.000000,
		-1.000000,  1.000000,  1.000000,
		-1.000000, -1.000000,  1.000000,
		 1.000000, -1.000000,  1.000000,
		 1.000000,  1.000000,  1.000000,
         1.000000, -1.000000,  1.000000,
		 1.000000, -1.000000, -1.000000,
		 1.000000,  1.000000, -1.000000,
         1.000000, -1.000000,  1.000000,
         1.000000,  1.000000, -1.000000,
         1.000000,  1.000000,  1.000000,
        -1.000000, -1.000000, -1.000000,
        -1.000000,  1.000000, -1.000000,
         1.000000,  1.000000, -1.000000,
        -1.000000, -1.000000, -1.000000,
         1.000000,  1.000000, -1.000000,
         1.000000, -1.000000, -1.000000,
        -1.000000, -1.000000, -1.000000,
		-1.000000, -1.000000,  1.000000,
		-1.000000,  1.000000, -1.000000,
		-1.000000, -1.000000,  1.000000,
		-1.000000,  1.000000,  1.000000,
		-1.000000,  1.000000, -1.000000,
		-1.000000,  1.000000, -1.000000,
		-1.000000,  1.000000,  1.000000,
		 1.000000,  1.000000, -1.000000,
		-1.000000,  1.000000,  1.000000,
		 1.000000,  1.000000,  1.000000,
		 1.000000,  1.000000, -1.000000,
		-1.000000, -1.000000,  1.000000,
		-1.000000, -1.000000, -1.000000,
		 1.000000, -1.000000, -1.000000,
		-1.000000, -1.000000,  1.000000,
		 1.000000, -1.000000, -1.000000,
		 1.000000, -1.000000,  1.000000,
	];

	computeVertexNormals( cube.vertices, cube.normals );

	return cube;
}

function cubeModel( subdivisionDepth = 0 ) {
	var cube = new simpleCubeModel();
	midPointRefinement( cube.vertices, subdivisionDepth );
	computeVertexNormals( cube.vertices, cube.normals );
	return cube;
}

// (unused)
function simpleTetrahedronModel( ) {
	
	var tetra = new emptyModelFeatures();
	
	tetra.vertices = [
		-1.000000,  0.000000, -0.707000, 
         0.000000,  1.000000,  0.707000, 
         1.000000,  0.000000, -0.707000, 
         1.000000,  0.000000, -0.707000, 
         0.000000,  1.000000,  0.707000, 
         0.000000, -1.000000,  0.707000, 
        -1.000000,  0.000000, -0.707000, 
         0.000000, -1.000000,  0.707000, 
         0.000000,  1.000000,  0.707000, 
        -1.000000,  0.000000, -0.707000, 
         1.000000,  0.000000, -0.707000, 
         0.000000, -1.000000,  0.707000,
	];

	computeVertexNormals( tetra.vertices, tetra.normals );

	return tetra;
}

// (unused)
function tetrahedronModel( subdivisionDepth = 0 ) {
	var tetra = new simpleTetrahedronModel();
	midPointRefinement( tetra.vertices, subdivisionDepth );
	computeVertexNormals( tetra.vertices, tetra.normals );
	return tetra;
}

// (unused, but can easily be used in place of the cubeModel() to create round disks - htLogic:28)
function sphereModel( subdivisionDepth = 2 ) {
	var sphere = new simpleCubeModel();
	midPointRefinement( sphere.vertices, subdivisionDepth );
	moveToSphericalSurface( sphere.vertices );
	computeVertexNormals( sphere.vertices, sphere.normals );
	return sphere;
}


//----------------------------------------------------------------------------
// Instantiating scene models

var sceneModels = [];
var rodHeight = 0.6;

// Model 0 - Rods Base
sceneModels.push( new cubeModel() );
sceneModels[0].tx = 0.0; sceneModels[0].ty = -rodHeight;
sceneModels[0].sx = 0.95; sceneModels[0].sy = 0.05; sceneModels[0].sz = 0.5;

// Model 1 - Left Rod
sceneModels.push( new cubeModel() );
sceneModels[1].tx = -0.6; sceneModels[1].ty = 0.0;
sceneModels[1].sx = 0.03; sceneModels[1].sy = rodHeight; sceneModels[1].sz = 0.03;

// Model 2 - Middle Rod
sceneModels.push( new cubeModel() );
sceneModels[2].tx = sceneModels[2].ty = 0.0;
sceneModels[2].sx = 0.03; sceneModels[2].sy = rodHeight; sceneModels[2].sz = 0.03;

// Model 3 - Right Rod
sceneModels.push( new cubeModel() );
sceneModels[3].tx = 0.6; sceneModels[3].ty = 0.0;
sceneModels[3].sx = 0.03; sceneModels[3].sy = rodHeight; sceneModels[3].sz = 0.03;

// Other models - Disks -> created in the htLogic.js file
