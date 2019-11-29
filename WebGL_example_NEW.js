//////////////////////////////////////////////////////////////////////////////
//
//  Tower of Hanoi - WebGL Simulation
//
//  Based on the materials provided by J. Madeira in Visual Computing classes
//
//////////////////////////////////////////////////////////////////////////////


//----------------------------------------------------------------------------
//
// Global Variables
//

var gl = null; // WebGL context
var shaderProgram = null;
var triangleVertexPositionBuffer = null;
var triangleVertexNormalBuffer = null;	

// The GLOBAL transformation parameters
var globalAngleYY = 0.0;
var globalTz = 0.0;

// GLOBAL Animation controls
var globalRotationYY_ON = 0;
var globalRotationYY_DIR = 1;
var globalRotationYY_SPEED = 1;

// To allow choosing the way of drawing the model triangles
var primitiveType = null;
 
// To allow choosing the projection type
var projectionType = 1;

// The viewer position
var pos_Viewer = [ 0.0, 0.0, 0.0, 1.0 ];

// TOWER OF HANOI
var numberOfDisks = 3;
var selectedDisk = null;
var totalMoves = 0;
var puzzleSolution = [];

//----------------------------------------------------------------------------
//
// Auxiliary variables and functions
//

var elapsedTime = 0;
var frameCount = 0;
var lastfpsTime = new Date().getTime();

function countFrames() {
   var now = new Date().getTime();
   frameCount++;
   elapsedTime += (now - lastfpsTime);
   lastfpsTime = now;

   if(elapsedTime >= 1000) {
       fps = frameCount;
       frameCount = 0;
       elapsedTime -= 1000;
	   document.getElementById('fps').innerHTML = 'fps:' + fps;
   }
}

// Solves the puzzle using an iterative solution (rebuilds tower on the right rod)
function getPuzzleSolution2() {
	//var start = new Date().getTime();
	puzzleSolution = [];
	var inc = numberOfDisks%2 === 0 ? 1 : 2;

	var smallestPiecePos = 0;
	var smallestPieceNextPos;
	while (puzzleSolution.length < 2**numberOfDisks-1){
		smallestPieceNextPos = (smallestPiecePos+inc)%3;
		moveDisk(smallestPiecePos, smallestPieceNextPos);
		puzzleSolution.push([smallestPiecePos, smallestPieceNextPos]);
		console.log(smallestPiecePos + ", " + smallestPieceNextPos);
		if (isMoveValid(smallestPiecePos, (smallestPieceNextPos+inc)%3)) {
			moveDisk(smallestPiecePos, (smallestPieceNextPos + inc) % 3);
			puzzleSolution.push([smallestPiecePos, (smallestPieceNextPos + inc) % 3]);
			console.log(smallestPiecePos + ", " + (smallestPieceNextPos + inc) % 3);
		}
		else {
			moveDisk((smallestPieceNextPos + inc) % 3, smallestPiecePos);
			puzzleSolution.push([(smallestPieceNextPos + inc) % 3, smallestPiecePos]);
			console.log((smallestPieceNextPos + inc) % 3 + ", " + smallestPiecePos);
		}
		smallestPiecePos = smallestPieceNextPos;
	}
	resetDisks(numberOfDisks);
	//console.log("solved in: " + new Date().getTime()-start + "ms\n");
	return puzzleSolution;
}
// Solves the puzzle using an iterative solution (rebuilds tower on the right rod)
function getPuzzleSolution() {
	//var start = new Date().getTime();
	puzzleSolution = [];
	var inc = numberOfDisks%2 === 0 ? 1 : 2;

	var smallestPiecePos = 0;
	var smallestPieceNextPos;
	while (puzzleSolution.length < 2**numberOfDisks-1){
		smallestPieceNextPos = (smallestPiecePos+inc)%3;
		puzzleSolution.push([smallestPiecePos, smallestPieceNextPos]);
		console.log(smallestPiecePos + ", " + smallestPieceNextPos);
		if (isMoveValid(smallestPiecePos, (smallestPieceNextPos+inc)%3)) {
			puzzleSolution.push([smallestPiecePos, (smallestPieceNextPos + inc) % 3]);
			console.log(smallestPiecePos + ", " + (smallestPieceNextPos + inc) % 3);
		}
		else {
			puzzleSolution.push([(smallestPieceNextPos + inc) % 3, smallestPiecePos]);
			console.log((smallestPieceNextPos + inc) % 3 + ", " + smallestPiecePos);
		}
		smallestPiecePos = smallestPieceNextPos;
	}
	//console.log("solved in: " + new Date().getTime()-start + "ms\n");
	return puzzleSolution;
}

// Solves the puzzle using an iterative solution (rebuilds tower on the right rod)
function solvePuzzle0( increment, smallestPiecePosition ) {
	var smallestPieceNextPos;
	smallestPieceNextPos = (smallestPiecePosition+increment)%3;
	moveDisk(smallestPiecePosition, smallestPieceNextPos);
	if (!moveDisk(smallestPiecePosition, (smallestPieceNextPos+increment)%3))
		moveDisk((smallestPieceNextPos+increment)%3, smallestPiecePosition);

	if (!isCompleted())
		setTimeout(solvePuzzle0, 1000, increment, smallestPieceNextPos);
}

// Solves the puzzle using an iterative solution (rebuilds tower on the right rod)
function solvePuzzle() {
	//var start = new Date().getTime();
	var inc = numberOfDisks%2 === 0 ? 1 : 2;

	var smallestPiecePos = 0;
	var smallestPieceNextPos;
	while (!isCompleted()){
		smallestPieceNextPos = (smallestPiecePos+inc)%3;
		moveDisk(smallestPiecePos, smallestPieceNextPos);
		if (!moveDisk(smallestPiecePos, (smallestPieceNextPos+inc)%3))
			moveDisk((smallestPieceNextPos+inc)%3, smallestPiecePos);
		smallestPiecePos = smallestPieceNextPos;
	}
	//console.log("solved in: " + new Date().getTime()-start + "ms\n");
}
// Unused function - solves the puzzle via a different iterative solution
// (rebuilds tower on the right rod if number of disks is even, middle rod if odd)
function solvePuzzle2() {
	//var start = new Date().getTime();
	if (numberOfDisks%2 === 0){
		while (!isCompleted()){
			if (!moveDisk(0, 1))
				moveDisk(1, 0);
			if (!moveDisk(0, 2))
				moveDisk(2, 0);
			if (!moveDisk(1, 2))
				moveDisk(2, 1);
		}
	} else {
		while (!isCompleted()) {
			if (!moveDisk(0, 2))
				moveDisk(2, 0);
			if (!moveDisk(0, 1))
				moveDisk(1, 0);
			if (!moveDisk(1, 2))
				moveDisk(2, 1);
		}
	}
	//console.log("solved in: " + new Date().getTime()-start + "ms\n");
}

/*
// Recursive solution to solve the puzzle
// Idea dropped because of incapability of creating delay in between disk movements, due to Javascript's asynchronous nature
function solvePuzzle(nDisks, originRod, destinationRod, remainingRod, currentTime) {
	if (nDisks==1) {
		delayMove(originRod, destinationRod, currentTime);

		// Failed attempt to add a delay between moves; comparison values above ~10(milliseconds) cause too much recursion
		//if ( new Date().getTime() - currentTime < 10)
		//	solvePuzzle(nDisks, originRod, destinationRod, remainingRod, currentTime);
		//else {
		//	moveDisk(originRod, destinationRod);
		//	drawScene();
		//}
	}
	else{
		solvePuzzle(nDisks-1, originRod, remainingRod, destinationRod, currentTime+300);
		solvePuzzle(1, originRod, destinationRod, remainingRod, currentTime+300);
		solvePuzzle(nDisks-1, remainingRod, destinationRod, originRod, currentTime+300);
	}
}
function delayMove(origRod, destRod, cTime) {
	if ( new Date().getTime() - cTime < 1000)
		setTimeout(delayMove, 1000, origRod, destRod, cTime);
	else {
		moveDisk(origRod, destRod);
		drawScene();
	}
}
*/

// Resets the puzzle to an initial state
function reset() {
	resetDisks(numberOfDisks);
	totalMoves = 0;
	document.getElementById('nMoves').innerHTML = 'Number of moves: ' + totalMoves;
	drawScene();
}

// Registers a successful move and tests the puzzle's completion
function successfulMove() {
	totalMoves += 1;
	document.getElementById('nMoves').innerHTML = 'Number of moves: ' + totalMoves;
	if (isCompleted()){
		drawScene();
		alert("Puzzle solved in " + totalMoves + " moves!")
		reset();
	}
}

//----------------------------------------------------------------------------
//
// The WebGL code
//

//----------------------------------------------------------------------------
//
//  Rendering
//

// Handling the Vertex Coordinates and the Vertex Normal Vectors

function initBuffers( model ) {	
	
	// Vertex Coordinates
		
	triangleVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
	triangleVertexPositionBuffer.itemSize = 3;
	triangleVertexPositionBuffer.numItems =  model.vertices.length / 3;			

	// Associating to the vertex shader
	
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
			triangleVertexPositionBuffer.itemSize, 
			gl.FLOAT, false, 0, 0);
	
	// Vertex Normal Vectors
		
	triangleVertexNormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( model.normals), gl.STATIC_DRAW);
	triangleVertexNormalBuffer.itemSize = 3;
	triangleVertexNormalBuffer.numItems = model.normals.length / 3;			

	// Associating to the vertex shader
	
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
			triangleVertexNormalBuffer.itemSize, 
			gl.FLOAT, false, 0, 0);	
}

//----------------------------------------------------------------------------
//  Drawing the model

function drawModel( model,
					mvMatrix,
					primitiveType ) {

	// The the global model transformation is an input
	
	// Concatenate with the particular model transformations
	
    // Pay attention to transformation order !!
    
	mvMatrix = mult( mvMatrix, translationMatrix( model.tx, model.ty, model.tz ) );
						 
	mvMatrix = mult( mvMatrix, rotationZZMatrix( model.rotAngleZZ ) );
	
	mvMatrix = mult( mvMatrix, rotationYYMatrix( model.rotAngleYY ) );
	
	mvMatrix = mult( mvMatrix, rotationXXMatrix( model.rotAngleXX ) );
	
	mvMatrix = mult( mvMatrix, scalingMatrix( model.sx, model.sy, model.sz ) );
						 
	// Passing the Model View Matrix to apply the current transformation
	
	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));
    
	// Associating the data to the vertex shader
	
	// This can be done in a better way !!

	// Vertex Coordinates and Vertex Normal Vectors
	
	initBuffers(model);
	
	// Material properties
	
	gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_ambient"), 
		flatten(model.kAmbi) );
    
    gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_diffuse"),
        flatten(model.kDiff) );
    
    gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_specular"),
        flatten(model.kSpec) );

	gl.uniform1f( gl.getUniformLocation(shaderProgram, "shininess"), 
		model.nPhong );

    // Light Sources
	
	var numLights = lightSources.length;
	
	gl.uniform1i( gl.getUniformLocation(shaderProgram, "numLights"), 
		numLights );

	//Light Sources
	
	for(var i = 0; i < lightSources.length; i++ )
	{
		gl.uniform1i( gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].isOn"),
			lightSources[i].isOn );
    
		gl.uniform4fv( gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].position"),
			flatten(lightSources[i].getPosition()) );
    
		gl.uniform3fv( gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].intensities"),
			flatten(lightSources[i].getIntensity()) );
    }
        
	// Drawing 
	
	// primitiveType allows drawing as filled triangles / wireframe / vertices
	
	if( primitiveType == gl.LINE_LOOP ) {
		
		// To simulate wireframe drawing!
		
		// No faces are defined! There are no hidden lines!
		
		// Taking the vertices 3 by 3 and drawing a LINE_LOOP
		
		var i;
		
		for( i = 0; i < triangleVertexPositionBuffer.numItems / 3; i++ ) {
		
			gl.drawArrays( primitiveType, 3 * i, 3 ); 
		}
	}	
	else {
				
		gl.drawArrays(primitiveType, 0, triangleVertexPositionBuffer.numItems); 
		
	}	
}

//----------------------------------------------------------------------------

//  Drawing the 3D scene

function drawScene() {
	
	var pMatrix;
	
	var mvMatrix = mat4();
	
	// Clearing the frame-buffer and the depth-buffer
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// Computing the Projection Matrix
	
	if( projectionType == 0 ) {
		
		// For now, the default orthogonal view volume
		
		pMatrix = ortho( -1.0, 1.0, -1.0, 1.0, -1.0, 1.0 );
		
		// Global transformation !!
		
		globalTz = 0.0;
		
		// NEW --- The viewer is on the ZZ axis at an indefinite distance
		
		pos_Viewer[0] = pos_Viewer[1] = pos_Viewer[3] = 0.0;
		
		pos_Viewer[2] = 1.0;  
		
		// TO BE DONE !
		
		// Allow the user to control the size of the view volume
	}
	else {	

		// A standard view volume.
		
		// Viewer is at (0,0,0)
		
		// Ensure that the model is "inside" the view volume
		
		pMatrix = perspective( 45, 1, 0.05, 15 );
		
		// Global transformation !!
		
		globalTz = -2.5;

		// NEW --- The viewer is on (0,0,0)
		
		pos_Viewer[0] = pos_Viewer[1] = pos_Viewer[2] = 0.0;

		pos_Viewer[3] = 1.0;
		
		// TO BE DONE !
		
		// Allow the user to control the size of the view volume
	}
	
	// Passing the Projection Matrix to apply the current projection
	
	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));
	
	// NEW --- Passing the viewer position to the vertex shader
	
	gl.uniform4fv( gl.getUniformLocation(shaderProgram, "viewerPosition"),
        flatten(pos_Viewer) );
	
	// GLOBAL TRANSFORMATION FOR THE WHOLE SCENE
	
	mvMatrix = translationMatrix( 0, 0, globalTz );
	
	// NEW - Updating the position of the light sources, if required
	
	// FOR EACH LIGHT SOURCE
	    
	for(var i = 0; i < lightSources.length; i++ )
	{
		// Animating the light source, if defined
		    
		var lightSourceMatrix = mat4();

		if( !lightSources[i].isOff() ) {
				
			// COMPLETE THE CODE FOR THE OTHER ROTATION AXES

			if( lightSources[i].isRotYYOn() ) 
			{
				lightSourceMatrix = mult( 
						lightSourceMatrix, 
						rotationYYMatrix( lightSources[i].getRotAngleYY() ) );
			}
		}
		
		// NEW Passing the Light Souree Matrix to apply
	
		var lsmUniform = gl.getUniformLocation(shaderProgram, "allLights["+ String(i) + "].lightSourceMatrix");
	
		gl.uniformMatrix4fv(lsmUniform, false, new Float32Array(flatten(lightSourceMatrix)));
	}
			
	// Instantiating the base and rods models
	for( var i = 0; i < sceneModels.length; i++ )
		drawModel( sceneModels[i], mvMatrix, primitiveType );
	// Instantiating the disks models
	var d;
	for (d in rods[0].diskStack)
		drawModel(rods[0].diskStack[d], mvMatrix, primitiveType);
	for (d in rods[1].diskStack)
		drawModel(rods[1].diskStack[d], mvMatrix, primitiveType);
	for (d in rods[2].diskStack)
		drawModel(rods[2].diskStack[d], mvMatrix, primitiveType);

	countFrames();
}


//----------------------------------------------------------------------------
// Animation --- Updating transformation parameters

var lastTime = 0;
var lastMoveTime = 0;

function animate() {
	
	var timeNow = new Date().getTime();
	
	if( lastTime != 0 ) {
		var elapsed = timeNow - lastTime;
		
		// Global rotation
		if( globalRotationYY_ON )
			globalAngleYY += globalRotationYY_DIR * globalRotationYY_SPEED * (90 * elapsed) / 1000.0;

		// For every model --- Local rotations
		for(var i = 0; i < sceneModels.length; i++ )
	    {
			if( sceneModels[i].rotXXOn )
				sceneModels[i].rotAngleXX += sceneModels[i].rotXXDir * sceneModels[i].rotXXSpeed * (90 * elapsed) / 1000.0;

			if( sceneModels[i].rotYYOn )
				sceneModels[i].rotAngleYY += sceneModels[i].rotYYDir * sceneModels[i].rotYYSpeed * (90 * elapsed) / 1000.0;

			if( sceneModels[i].rotZZOn )
				sceneModels[i].rotAngleZZ += sceneModels[i].rotZZDir * sceneModels[i].rotZZSpeed * (90 * elapsed) / 1000.0;
		}
		
		// Rotating the light sources
		for(var i = 0; i < lightSources.length; i++ )
			if( lightSources[i].isRotYYOn() ) {
				var angle = lightSources[i].getRotAngleYY() + lightSources[i].getRotationSpeed() * (90 * elapsed) / 1000.0;
				lightSources[i].setRotAngleYY( angle );
			}
	}
	lastTime = timeNow;

	// If asked a puzzle solution was requested, process the solving moves
	if (puzzleSolution.length > 0)
		if (new Date().getTime()-lastMoveTime > 1000) {
			var move = puzzleSolution.shift();
			moveDisk(move[0], move[1]);
			lastMoveTime = new Date().getTime();
		}
}


//----------------------------------------------------------------------------
// Timer
function tick() {
	requestAnimFrame(tick);
	drawScene();
	animate();
}


//----------------------------------------------------------------------------
// User Interaction - UI Events
function setEventListeners(){

	// Dropdown list: number of disks
	var ndSel = document.getElementById("nDisks-selection");
	ndSel.onchange = function(){
		numberOfDisks = ndSel.options[ndSel.selectedIndex].text;
		reset();
		createDisks(numberOfDisks);
	};

	// Dropdown list: projection type
	var projection = document.getElementById("projection-selection");
	projection.addEventListener("click", function(){
		var p = projection.selectedIndex;

		switch(p){
			case 0 : projectionType = 1;
				break;
			case 1 : projectionType = 0;
				break;
		}  	
	});      

	// Dropdown list: rendering mode
	var list = document.getElementById("rendering-mode-selection");
	list.addEventListener("click", function(){
		var mode = list.selectedIndex;
				
		switch(mode){
			case 0 : primitiveType = gl.TRIANGLES;
				break;
			case 1 : primitiveType = gl.LINE_LOOP;
				break;
			case 2 : primitiveType = gl.POINTS;
				break;
		}
	});

	// Button: select (disk in) left tower
	document.getElementById("select_lt").onclick = function() {
		if (selectedDisk == 0)
			selectedDisk = null;
		else
			selectedDisk = 0;
	}
	// Button: select (disk in) middle tower
	document.getElementById("select_mt").onclick = function() {
		if (selectedDisk == 1)
			selectedDisk = null;
		else
			selectedDisk = 1;
	}
	// Button: select (disk in) right tower
	document.getElementById("select_rt").onclick = function() {
		if (selectedDisk == 2)
			selectedDisk = null;
		else
			selectedDisk = 2;
	}

	// Button: drop (disk in) left tower
	document.getElementById("drop_lt").onclick = function() {
		if (selectedDisk == null)
			alert("No disk selected!");
		else {
			if (!moveDisk(selectedDisk, 0))
				alert("Invalid move!");
			else
				successfulMove();
			selectedDisk = null;
		}
	}
	// Button: drop (disk in) middle tower
	document.getElementById("drop_mt").onclick = function() {
		if (selectedDisk == null)
			alert("No disk selected!");
		else {
			if (!moveDisk(selectedDisk, 1))
				alert("Invalid move!");
			else
				successfulMove();
			selectedDisk = null;
		}
	}
	// Button: drop (disk in) right tower
	document.getElementById("drop_rt").onclick = function() {
		if (selectedDisk == null)
			alert("No disk selected!");
		else {
			if (!moveDisk(selectedDisk, 2))
				alert("Invalid move!");
			else
				successfulMove();
			selectedDisk = null;
		}
	}

	// Button: solve puzzle
	document.getElementById("solve").onclick = function() {
		if (totalMoves == 0)
			getPuzzleSolution2();
			//solvePuzzle0(numberOfDisks%2 === 0 ? 1 : 2, 0);
			// Unused recursive function to solve the puzzle
			//solvePuzzle(numberOfDisks, 0, 2, 1, new Date().getTime());
		else if (confirm("This option solves the puzzle from an initial state.\nPuzzle will be reset and progress lost.\nContinue?")) {
			reset();
			solvePuzzle();
		}
	}

	// Button: reset puzzle
	document.getElementById("reset").onclick = function() {
		reset();
	}
}


//----------------------------------------------------------------------------
// WebGL Initialization
function initWebGL( canvas ) {
	try {
		// Create the WebGL context
		// Some browsers still need "experimental-webgl"
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		
		// DEFAULT: The viewport occupies the whole canvas
		// DEFAULT: The viewport background color is WHITE
		// NEW - Drawing the triangles defining the model
		primitiveType = gl.TRIANGLES;
		
		// DEFAULT: Face culling is DISABLED
		// Enable FACE CULLING
		gl.enable( gl.CULL_FACE );
		
		// DEFAULT: The BACK FACE is culled!!
		// The next instruction is not needed...
		gl.cullFace( gl.BACK );
		
		// Enable DEPTH-TEST
		gl.enable( gl.DEPTH_TEST );
        
	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry! :-(");
	}        
}


//----------------------------------------------------------------------------
function runWebGL() {
	var canvas = document.getElementById("my-canvas");
	initWebGL( canvas );
	shaderProgram = initShaders( gl );
	setEventListeners();
	tick();		// A timer controls the rendering / animation
}
