//////////////////////////////////////////////////////////////////////////////
//
//  For instantiating the scene models.
//
//  J. Madeira - November 2018
//
//////////////////////////////////////////////////////////////////////////////

//----------------------------------------------------------------------------
//
//  Constructors
//


function emptyModelFeatures() {

	// EMPTY MODEL

	this.vertices = [];

	this.normals = [];

	// Transformation parameters

	// Displacement vector
	
	this.tx = 0.0;
	
	this.ty = 0.0;
	
	this.tz = 0.0;	
	
	// Rotation angles	
	
	this.rotAngleXX = 0.0;
	
	this.rotAngleYY = 0.0;
	
	this.rotAngleZZ = 0.0;	

	// Scaling factors
	
	this.sx = 1.0;
	
	this.sy = 1.0;
	
	this.sz = 1.0;		
	
	// Animation controls
	
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
	
	this.kAmbi = [ 0.3, 0.15, 0.0 ];
	
	this.kDiff = [ 0.6, 0.3, 0.0 ];

	this.kSpec = [ 0.3, 0.15, 0.0 ];

	this.nPhong = 100;
}

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


function tetrahedronModel( subdivisionDepth = 0 ) {
	
	var tetra = new simpleTetrahedronModel();
	
	midPointRefinement( tetra.vertices, subdivisionDepth );
	
	computeVertexNormals( tetra.vertices, tetra.normals );
	
	return tetra;
}


function sphereModel( subdivisionDepth = 2 ) {
	
	var sphere = new simpleCubeModel();
	
	midPointRefinement( sphere.vertices, subdivisionDepth );
	
	moveToSphericalSurface( sphere.vertices )
	
	computeVertexNormals( sphere.vertices, sphere.normals );
	
	return sphere;
}


//----------------------------------------------------------------------------
//
//  Instantiating scene models
//

var sceneModels = [];

// Model 0 --- Left Rod
sceneModels.push( new cubeModel() );
sceneModels[0].tx = -0.6; sceneModels[0].ty = -0.1;
sceneModels[0].sx = 0.03; sceneModels[0].sy = 0.8; sceneModels[0].sz = 0.03;

// Model 1 --- Middle Rod
sceneModels.push( new cubeModel() );
sceneModels[1].tx = 0.0; sceneModels[1].ty = -0.1;
sceneModels[1].sx = 0.03; sceneModels[1].sy = 0.8; sceneModels[1].sz = 0.03;

// Model 2 --- Right Rod
sceneModels.push( new cubeModel() );
sceneModels[2].tx = 0.6; sceneModels[2].ty = -0.1;
sceneModels[2].sx = 0.03; sceneModels[2].sy = 0.8; sceneModels[2].sz = 0.03;

// Model 3 --- Rods Base
sceneModels.push( new cubeModel() );
sceneModels[3].tx = 0.0; sceneModels[3].ty = -0.9;
sceneModels[3].sx = 0.9; sceneModels[3].sy = 0.05; sceneModels[3].sz = 0.5;

// Other models --- Disks
modelDisks();

function modelDisks()
{
    var diskColors = [  [[0.5, 0.0, 0.0], [1.0, 0.0, 0.0], [1.0, 1.0, 1.0]],
						[[0.0, 0.5, 0.0], [0.0, 1.0, 0.0], [1.0, 1.0, 1.0]],
						[[0.0, 0.0, 0.5], [0.0, 0.0, 1.0], [1.0, 1.0, 1.0]],
						[[0.5, 0.5, 0.0], [1.0, 1.0, 0.0], [1.0, 1.0, 1.0]],
						[[0.5, 0.0, 0.5], [1.0, 0.0, 1.0], [1.0, 1.0, 1.0]],
						[[0.0, 0.5, 0.5], [0.0, 1.0, 1.0], [1.0, 1.0, 1.0]] ];
    diskColors.sort(function(a, b){return 0.5 - Math.random()});
    var nModels = sceneModels.length;
    for ( var d=0; d<6; d++)
    {
        sceneModels.push( new cubeModel( 3 ) );
        sceneModels[nModels+d].tx = -0.6; sceneModels[nModels+d].ty = -0.8+0.1*d;
        sceneModels[nModels+d].sx = 0.3-0.03*d; sceneModels[nModels+d].sy = 0.05; sceneModels[nModels+d].sz = 0.3-0.03*d;
        sceneModels[nModels+d].kAmbi = diskColors[d][0];
        sceneModels[nModels+d].kDiff = diskColors[d][1];
        sceneModels[nModels+d].kSpec = diskColors[d][2];
    }
}
/*
// plastic material
diskColors[0] = [[0.3, 0.0, 0.0], [0.6, 0.0, 0.0], [0.8, 0.6, 0.6]];
diskColors[1] = [[0.0, 0.3, 0.0], [0.0, 0.6, 0.0], [0.6, 0.8, 0.6]];
diskColors[2] = [[0.0, 0.0, 0.3], [0.0, 0.0, 0.3], [0.6, 0.6, 0.8]];
diskColors[3] = [[0.3, 0.3, 0.0], [0.6, 0.6, 0.0], [0.8, 0.8, 0.6]];
diskColors[4] = [[0.3, 0.0, 0.3], [0.6, 0.0, 0.6], [0.8, 0.6, 0.8]];
diskColors[5] = [[0.0, 0.3, 0.3], [0.0, 0.6, 0.6], [0.6, 0.8, 0.8]];
*/

/*
// Model 6 --- Big Piece
sceneModels.push( new sphereModel( 3 ) );
sceneModels[6].tx = -0.6; sceneModels[6].ty = -0.5;
sceneModels[6].sx = 0.3; sceneModels[6].sy = 0.05; sceneModels[6].sz = 0.3;
sceneModels[6].kAmbi = [ 0.3, 0.0, 0.0 ];
sceneModels[6].kDiff = [ 0.6, 0.0, 0.0 ];
sceneModels[6].kSpec = [ 0.8, 0.6, 0.6 ];

// Model 7 --- Medium Piece
sceneModels.push( new sphereModel( 3 ) );
sceneModels[7].tx = -0.6; sceneModels[7].ty = -0.4;
sceneModels[7].sx = 0.25; sceneModels[7].sy = 0.05; sceneModels[7].sz = 0.25;
sceneModels[7].kAmbi = [ 0.0, 0.3, 0.0 ];
sceneModels[7].kDiff = [ 0.0, 0.6, 0.0 ];
sceneModels[7].kSpec = [ 0.6, 0.8, 0.6 ];

// Model 8 --- Small Piece
sceneModels.push( new sphereModel( 3 ) );
sceneModels[8].tx = -0.6; sceneModels[8].ty = -0.3;
sceneModels[8].sx = 0.2; sceneModels[8].sy = 0.05; sceneModels[8].sz = 0.2;
sceneModels[8].kAmbi = [ 0.0, 0.0, 0.3 ];
sceneModels[8].kDiff = [ 0.0, 0.0, 0.6 ];
sceneModels[8].kSpec = [ 0.6, 0.6, 0.8 ];
*/
