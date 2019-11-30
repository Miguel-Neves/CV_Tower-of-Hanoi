//////////////////////////////////////////////////////////////////////////////
//
//  Tower of Hanoi - logic
//
//////////////////////////////////////////////////////////////////////////////

//---------- FUNCTIONS ----------//

// Rod constructor
function Rod( xPos ) {
    this.xPosition = xPos;
    this.diskStack = [];
}

// Rod method - returns the y value for the next disk to be inserted
Rod.prototype.nextDiskHeight = function(){
    if (this.diskStack.length > 0)
        return this.diskStack[this.diskStack.length-1].ty + diskHeight;
    return diskHeight - rodHeight;
};

// Create nDisks amount of disks, and organize them in the left rod
function createDisks( nDisks ) {
    rods[0].diskStack = [];
    for (var d = 0; d < nDisks; d++) {
        rods[0].diskStack.push(new cubeModel(3));
        // In case the user prefers round disks (flattened spheres)
        //rods[0].diskStack.push(new sphereModel(3));
        rods[0].diskStack[d].tx = rods[0].xPosition;
        rods[0].diskStack[d].ty = diskHeight * (d+1) - rodHeight;
        rods[0].diskStack[d].sx = 0.3 - 0.03 * d;
        rods[0].diskStack[d].sy = diskHeight/2;
        rods[0].diskStack[d].sz = 0.3 - 0.03 * d;
        rods[0].diskStack[d].kAmbi = diskColors[d][0];
        rods[0].diskStack[d].kDiff = diskColors[d][1];
        rods[0].diskStack[d].kSpec = diskColors[d][2];
    }
}

// Checks if a disk movement is valid
function isMoveValid( rodOrigin, rodDestination ) {
    // Checks if the puzzle is already completed or if there are disks in the origin rod
    if (isCompleted() || rods[rodOrigin].diskStack.length == 0)
        return false;
    // Checks if there are disks in the destination rod
    if (rods[rodDestination].diskStack.length == 0)
        return true;
    // Compares the sizes of the moving disk and the disk at the destination
    return rods[rodDestination].diskStack.slice(-1)[0].sx > rods[rodOrigin].diskStack.slice(-1)[0].sx;
}

// Moves a disk from rodOrigin to rodDestination, if legal
function moveDisk( rodOrigin, rodDestination ) {
    // Check if the movement is valid
    if (!isMoveValid(rodOrigin, rodDestination))
        return false;

    // Update the disk's x position (adjusts small coordinate values deviations)
    rods[rodOrigin].diskStack[rods[rodOrigin].diskStack.length-1].tx = rods[rodDestination].xPosition;
    // Update the disk's y position (adjusts small coordinate values deviations)
    rods[rodOrigin].diskStack[rods[rodOrigin].diskStack.length-1].ty = rods[rodDestination].nextDiskHeight();
    // Move the disk between rods
    rods[rodDestination].diskStack.push(rods[rodOrigin].diskStack.pop());
    return true;
}

// Checks if the puzzle is completed
function isCompleted() {
    return rods[0].diskStack.length == 0 && (rods[1].diskStack.length == 0 || rods[2].diskStack.length == 0);
}

// Resets the disks to an initial state
function resetDisks( nDisks ) {
    rods[0].diskStack = [];
    rods[1].diskStack = [];
    rods[2].diskStack = [];
    createDisks(nDisks);
}

//---------- VARIABLES & INITIALIZATION ----------//

// Initialize the three rods that may contain the disks
var rods = [];
rods[0] = new Rod(sceneModels[1].tx);
rods[1] = new Rod(sceneModels[2].tx);
rods[2] = new Rod(sceneModels[3].tx);

// Array of colors/materials to be randomly selected for the disks
// (very bright colors)
var diskColors = [  [[0.5, 0.0, 0.0], [1.0, 0.0, 0.0], [1.0, 1.0, 1.0]],
                    [[0.0, 0.5, 0.0], [0.0, 1.0, 0.0], [1.0, 1.0, 1.0]],
                    [[0.0, 0.0, 0.5], [0.0, 0.0, 1.0], [1.0, 1.0, 1.0]],
                    [[0.5, 0.5, 0.0], [1.0, 1.0, 0.0], [1.0, 1.0, 1.0]],
                    [[0.5, 0.0, 0.5], [1.0, 0.0, 1.0], [1.0, 1.0, 1.0]],
                    [[0.0, 0.5, 0.5], [0.0, 1.0, 1.0], [1.0, 1.0, 1.0]] ];
/*
// (colored plastic material)
var diskColors = [  [[0.3, 0.0, 0.0], [0.6, 0.0, 0.0], [0.8, 0.6, 0.6]],
                    [[0.0, 0.3, 0.0], [0.0, 0.6, 0.0], [0.6, 0.8, 0.6]],
                    [[0.0, 0.0, 0.3], [0.0, 0.0, 0.3], [0.6, 0.6, 0.8]],
                    [[0.3, 0.3, 0.0], [0.6, 0.6, 0.0], [0.8, 0.8, 0.6]],
                    [[0.3, 0.0, 0.3], [0.6, 0.0, 0.6], [0.8, 0.6, 0.8]],
                    [[0.0, 0.3, 0.3], [0.0, 0.6, 0.6], [0.6, 0.8, 0.8]] ];
*/
diskColors.sort(function(a, b){return 0.5 - Math.random()});

// Defining the disks thickness
var diskHeight = 0.1;

// Initialization of three disks
createDisks(3);
