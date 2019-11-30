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

// Global rotation angles
var angleXX = 0.0;
var angleYY = 0.0;

// TOWER OF HANOI
var numberOfDisks = 3;
var totalMoves = 0;
var puzzleSolution = [];
var selectedRod = null;
var moveToRod = null;
var deselectHeight = null;

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

// Generates an array with the puzzle solving disk movements
// Solves the puzzle using an iterative solution (rebuilds tower on the right rod)
function getPuzzleSolution() {
	//var start = new Date().getTime();
	puzzleSolution = [];
	var inc = numberOfDisks%2 === 0 ? 1 : 2;

	var smallestPiecePos = 0;
	var smallestPieceNextPos;
	while (!isCompleted()){
		smallestPieceNextPos = (smallestPiecePos+inc)%3;
		moveDisk(smallestPiecePos, smallestPieceNextPos);
		puzzleSolution.push([smallestPiecePos, smallestPieceNextPos]);
		if (moveDisk(smallestPiecePos, (smallestPieceNextPos + inc) % 3))
			puzzleSolution.push([smallestPiecePos, (smallestPieceNextPos + inc) % 3]);
		else if (moveDisk((smallestPieceNextPos + inc) % 3, smallestPiecePos))
			puzzleSolution.push([(smallestPieceNextPos + inc) % 3, smallestPiecePos]);
		smallestPiecePos = smallestPieceNextPos;
	}
	resetDisks(numberOfDisks);
	//console.log("solved in: " + new Date().getTime()-start + "ms\n");
	return puzzleSolution;
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
	puzzleSolution = [];
	selectedRod = moveToRod = deselectHeight = null;
	lastMoveTime = new Date().getTime();
	totalMoves = 0;
	document.getElementById('nMoves').innerHTML = 'Number of moves: ' + totalMoves;
	toggleInterface(true);
	drawScene();
}

// Registers a successful move and tests the puzzle's completion
function successfulMove() {
	totalMoves += 1;
	document.getElementById('nMoves').innerHTML = 'Number of moves: ' + totalMoves;
	if (isCompleted()){
		toggleInterface(true);
		drawScene();
		alert("Puzzle solved in " + totalMoves + " moves!");
		reset();
	}
}

// Enables/disables the interface's buttons, to prevent conflicts between elongated actions
function toggleInterface( onoff ) {
	document.getElementById("select_lt").disabled = !onoff;
	document.getElementById("select_mt").disabled = !onoff;
	document.getElementById("select_rt").disabled = !onoff;
	document.getElementById("place_lt").disabled = !onoff;
	document.getElementById("place_mt").disabled = !onoff;
	document.getElementById("place_rt").disabled = !onoff;
	document.getElementById("solve").disabled = !onoff;
	//document.getElementById("reset").disabled = !onoff;
	document.getElementById("nDisks-selection").disabled = !onoff;
}

//----------------------------------------------------------------------------
//
// The WebGL code
//

//----------------------------------------------------------------------------
// Rendering

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

function drawModel( model, mvMatrix, primitiveType ) {

	// The transformation order allows a global rotation of all models around the origin point
	// (there is no rotation on the Z axis)
	mvMatrix = mult( mvMatrix, translationMatrix( 0.0, 0.0, -0.5 ) );
	mvMatrix = mult( mvMatrix, rotationYYMatrix( angleYY ) );
	mvMatrix = mult( mvMatrix, rotationXXMatrix( angleXX ) );
	mvMatrix = mult( mvMatrix, translationMatrix( model.tx, model.ty, model.tz ) );
	mvMatrix = mult( mvMatrix, scalingMatrix( model.sx, model.sy, model.sz ) );
						 
	// Passing the Model View Matrix to apply the current transformation
	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));
    
	// Associating the data to the vertex shader
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
	gl.uniform1i( gl.getUniformLocation(shaderProgram, "numLights"), numLights );

	for (var i = 0; i < numLights; i++ ) {
		gl.uniform1i( gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].isOn"),
			lightSources[i].isOn );
		gl.uniform4fv( gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].position"),
			flatten(lightSources[i].getPosition()) );
		gl.uniform3fv( gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].intensities"),
			flatten(lightSources[i].getIntensity()) );
    }
        
	// Drawing
	// primitiveType allows drawing as filled triangles / wireframe / vertices
	if( primitiveType == gl.LINE_LOOP )
		for( var j = 0; j < triangleVertexPositionBuffer.numItems / 3; j++ )
			gl.drawArrays( primitiveType, 3 * j, 3 );
	else
		gl.drawArrays(primitiveType, 0, triangleVertexPositionBuffer.numItems);
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
		
		// Global transformation
		globalTz = 0.0;
		
		// The viewer is on the ZZ axis at an indefinite distance
		pos_Viewer[0] = pos_Viewer[1] = pos_Viewer[3] = 0.0;
		pos_Viewer[2] = 1.0;
	}
	else {
		// A standard view volume.
		// Viewer is at (0,0,0)
		// Ensure that the model is "inside" the view volume
		pMatrix = perspective( 45, 1, 0.05, 15 );
		
		// Global transformation
		globalTz = -2.5;

		// The viewer is on (0,0,0)
		pos_Viewer[0] = pos_Viewer[1] = pos_Viewer[2] = 0.0;
		pos_Viewer[3] = 1.0;
	}
	
	// Passing the Projection Matrix to apply the current projection
	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));
	
	// Passing the viewer position to the vertex shader
	gl.uniform4fv( gl.getUniformLocation(shaderProgram, "viewerPosition"), flatten(pos_Viewer) );
	
	// GLOBAL TRANSFORMATION FOR THE WHOLE SCENE
	mvMatrix = translationMatrix( 0, 0, globalTz );
	
	// Updating the position of the light sources (unused)
	for(var i = 0; i < lightSources.length; i++ ){
		// Animating the light source
		var lightSourceMatrix = mat4();

		if( !lightSources[i].isOff() )
			if( lightSources[i].isRotYYOn() )
				lightSourceMatrix = mult(lightSourceMatrix, rotationYYMatrix(lightSources[i].getRotAngleYY()));
		
		// Passing the Light Source Matrix to apply
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

var lastMoveTime = 0;

function animate() {

	// If a disk is selected, animate its movement
	if (selectedRod != null) {
		var dIndex = rods[selectedRod].diskStack.length - 1;

		// disk was deselected (needs to move back down)
		if (moveToRod != null && selectedRod == moveToRod) {
			// disk is above its original position (needs to move back down)
			if (Math.abs(rods[selectedRod].diskStack[dIndex].ty - deselectHeight) > 0.01)
				rods[selectedRod].diskStack[dIndex].ty -= 0.1;
			// disk is back in its original position
			else {
				selectedRod = moveToRod = deselectHeight = null;
				toggleInterface(true);
			}
		}
		// disk is on the origin rod (needs to move up)
		else if (rods[selectedRod].diskStack[dIndex].tx == rods[selectedRod].xPosition && rods[selectedRod].diskStack[dIndex].ty < 0.8)
			rods[selectedRod].diskStack[dIndex].ty += 0.1;
		// disk is above the origin rod, and no destination has been chosen yet
		else if (moveToRod == null)
			toggleInterface(true);
		// disk is at the destination rod
		// (cannot use ==0 as condition, because the floating-point problem prevents arithmetic operations' results to reach some exact decimals, such as 0.0)
		// else if (rods[selectedRod].diskStack[dIndex].tx == rods[moveToRod].xPosition) {
		else if (Math.abs(rods[selectedRod].diskStack[dIndex].tx - rods[moveToRod].xPosition) < 0.01) {
			// disk is above its final position (needs to go down)
			// (cannot use disk height > destination height, due to the same floating-point problem)
			// if (rods[selectedRod].diskStack[dIndex].ty > rods[moveToRod].nextDiskHeight())
			if (rods[selectedRod].diskStack[dIndex].ty - rods[moveToRod].nextDiskHeight() > 0.01)
				rods[selectedRod].diskStack[dIndex].ty -= 0.1;
			// disk is in its final position
			else {
				moveDisk(selectedRod, moveToRod);
				selectedRod = moveToRod = null;
				successfulMove();
				toggleInterface(true);
			}
		} // disk is to the left of the destination rod (needs to move right)
		else if (rods[selectedRod].diskStack[dIndex].tx < rods[moveToRod].xPosition)
			rods[selectedRod].diskStack[dIndex].tx += 0.1;
		// disk is to the right of the destination rod (needs to move left)
		else if (rods[selectedRod].diskStack[dIndex].tx > rods[moveToRod].xPosition)
			rods[selectedRod].diskStack[dIndex].tx -= 0.1;
	}

	// If a puzzle solution was requested, process the solving movements
	if (puzzleSolution.length > 0)
		toggleInterface(false);
		// Each movement is processed in 1000ms intervals, to allow the animation to play
		if (new Date().getTime()-lastMoveTime > 1000) {
			var movement = puzzleSolution.shift();
			selectedRod = movement[0];
			moveToRod = movement[1];
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
// Handling mouse events

var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

// Registers the mouse button press to enable tracking its movement
function handleMouseDown(event) {
	mouseDown = true;
	lastMouseX = event.clientX;
	lastMouseY = event.clientY;
}

// Registers the mouse button release to stop "tracking" its movement
function handleMouseUp(event) {
	mouseDown = false;
}

// If the mouse is being clicked, apply a global rotation to all the models, according to the mouse's movement
// (to simulate camera rotation control)
function handleMouseMove(event) {
	if (!mouseDown)
		return;

	// Rotation angles proportional to cursor displacement
	var newX = event.clientX;
	var newY = event.clientY;

	var deltaX = newX - lastMouseX;
	angleYY += radians( 10 * deltaX  );

	var deltaY = newY - lastMouseY;
	angleXX += radians( 10 * deltaY  );

	lastMouseX = newX;
	lastMouseY = newY;
}

//----------------------------------------------------------------------------
// User Interaction - UI Events

function setEventListeners( canvas ){

	// Mouse events
	// Triggers if the mouse button is clicked inside the canvas
	canvas.onmousedown = handleMouseDown;
	// Triggers if the mouse button is released (anywhere)
	document.onmouseup = handleMouseUp;
	// Triggers if the mouse is moved (anywhere)
	document.onmousemove = handleMouseMove;

	// Dropdown list: number of disks
	var ndSel = document.getElementById("nDisks-selection");
	ndSel.onchange = function(){
		numberOfDisks = ndSel.options[ndSel.selectedIndex].text;
		reset();
		createDisks(numberOfDisks);
	};

	// Dropdown list: projection type
	var projection = document.getElementById("projection-selection");
	projection.onchange = function(){
		projectionType = projection.selectedIndex;
	};

	// Dropdown list: rendering mode
	var list = document.getElementById("rendering-mode-selection");
	list.onchange = function(){
		switch(list.selectedIndex){
			case 0 : primitiveType = gl.TRIANGLES;
				break;
			case 1 : primitiveType = gl.LINE_LOOP;
				break;
			case 2 : primitiveType = gl.POINTS;
				break;
		}
	};

	// Button: select (top disk on) left tower
	document.getElementById("select_lt").onclick = function() {
		if (selectedRod == null) {
			if (rods[0].diskStack.length > 0) {
				deselectHeight = rods[0].diskStack[rods[0].diskStack.length - 1].ty;
				selectedRod = 0;
				toggleInterface(false);
			} else {
				selectedRod = null;
				alert("There are no disks on the left rod!");
			}
		} else if (selectedRod == 0) {
			moveToRod = 0;
			toggleInterface(false);
		} else {
			moveToRod = selectedRod;
			toggleInterface(false);
		}

	};
	// Button: select (top disk on) middle tower
	document.getElementById("select_mt").onclick = function() {
		if (selectedRod == null) {
			if (rods[1].diskStack.length > 0) {
				deselectHeight = rods[1].diskStack[rods[1].diskStack.length - 1].ty;
				selectedRod = 1;
				toggleInterface(false);
			} else {
				selectedRod = null;
				alert("There are no disks on the middle rod!");
			}
		} else if (selectedRod == 1){
			moveToRod = 1;
			toggleInterface(false);
		} else {
			moveToRod = selectedRod;
			toggleInterface(false);
		}
	};
	// Button: select (top disk on) right tower
	document.getElementById("select_rt").onclick = function() {
		if (selectedRod == null) {
			if (rods[2].diskStack.length > 0) {
				deselectHeight = rods[2].diskStack[rods[2].diskStack.length - 1].ty;
				selectedRod = 2;
				toggleInterface(false);
			} else {
				selectedRod = null;
				alert("There are no disks on the right rod!");
			}
		} else if (selectedRod == 2){
			moveToRod = 2;
			toggleInterface(false);
		} else {
			moveToRod = selectedRod;
			toggleInterface(false);
		}
	};

	// Button: place (selected disk on) left tower
	document.getElementById("place_lt").onclick = function() {
		if (selectedRod == null)
			alert("No disk selected!");
		else {
			if (!isMoveValid(selectedRod, 0))
				alert("Invalid move!");
			else {
				moveToRod = 0;
				toggleInterface(false);
			}
		}
	};
	// Button: place (selected disk on) middle tower
	document.getElementById("place_mt").onclick = function() {
		if (selectedRod == null)
			alert("No disk selected!");
		else {
			if (!isMoveValid(selectedRod, 1))
				alert("Invalid move!");
			else {
				moveToRod = 1;
				toggleInterface(false);
			}
		}
	};
	// Button: place (selected disk on) right tower
	document.getElementById("place_rt").onclick = function() {
		if (selectedRod == null)
			alert("No disk selected!");
		else {
			if (!isMoveValid(selectedRod, 2))
				alert("Invalid move!");
			else {
				moveToRod = 2;
				toggleInterface(false);
			}
		}
	};

	// Button: solve puzzle
	document.getElementById("solve").onclick = function() {
		if (totalMoves == 0) {
			toggleInterface(false);
			getPuzzleSolution();
			// Unused recursive function to solve the puzzle
			//solvePuzzle(numberOfDisks, 0, 2, 1, new Date().getTime());
		}
		else if (confirm("This option solves the puzzle from an initial state.\nPuzzle will be reset and progress lost.\nContinue?")) {
			reset();
			toggleInterface(false);
			getPuzzleSolution();
		}
	};

	// Button: reset puzzle
	document.getElementById("reset").onclick = function() {
		reset();
	};

	// Button: reset visual	options
	document.getElementById("reset-view").onclick = function() {
		angleXX = 0.0;
		angleYY = 0.0;
		document.getElementById("projection-selection").selectedIndex = projectionType = 1;
		document.getElementById("rendering-mode-selection").selectedIndex = 0;
		primitiveType = gl.TRIANGLES;
	};
}


//----------------------------------------------------------------------------
// WebGL Initialization
function initWebGL( canvas ) {
	try {
		// Create the WebGL context
		// (some browsers still need "experimental-webgl")
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		
		// DEFAULT: The viewport occupies the whole canvas
		// DEFAULT: The viewport background color is WHITE
		// Drawing the triangles defining the model
		primitiveType = gl.TRIANGLES;
		
		// DEFAULT: Face culling is DISABLED
		// Enable FACE CULLING
		gl.enable( gl.CULL_FACE );
		
		// DEFAULT: The BACK FACE is culled
		// (unnecessary instruction)
		gl.cullFace( gl.BACK );
		
		// Enable DEPTH-TEST
		gl.enable( gl.DEPTH_TEST );
        
	} catch (e) {
	}
	if (!gl)
		alert("Could not initialize WebGL, sorry! :-(");
}


//----------------------------------------------------------------------------
function runWebGL() {
	var canvas = document.getElementById("my-canvas");
	initWebGL( canvas );
	shaderProgram = initShaders( gl );
	setEventListeners( canvas );
	tick();	// A timer controls the rendering / animation
}
