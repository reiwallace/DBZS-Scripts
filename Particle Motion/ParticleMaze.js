// ParticleMaze.js
// AUTHOR: Noxie

var PARTICLE_PATH = "plug:textures/blocks/concrete_periwinkle.png";
var MAZE_POSITIONS = [
    [-199.5, 57, -766.5],
    [-199.5, 57, -763.5],
    [-195.5, 57, -763.5],
    [-195.5, 57, -761.5],
    [-201.5, 57, -761.5],
    [-201.5, 57, -762.5],
    [-203.5, 57, -762.5],
    [-203.5, 57, -759.5],
    [-198.5, 57, -759.5],
    [-198.5, 57, -756.5],
    [-200.5, 57, -756.5],
    [-200.5, 57, -757.5],
    [-202.5, 57, -757.5],
    [-202.5, 57, -753.5]
];
var newPos = new Array();
var newMotion = new Array();
var duration = 0;
var count = 0;


// Timers
var MOVE_PARTICLES = 0;
var STOP_MOVEMENT = 1;

function interact(event)
{ // Starts particle movememnt on interacting with npc
    var npc = event.npc
    newPos = MAZE_POSITIONS[0];
    // Calculate angle to next maze position
    var angle = getDirection(MAZE_POSITIONS[0][0], MAZE_POSITIONS[0][2], MAZE_POSITIONS[1][0], MAZE_POSITIONS[1][2]);
    count = 0;
    motionX = -Math.cos(angle) * 0.2;
    motionZ = -Math.sin(angle) * 0.2;
    newMotion = [motionX, 0, motionZ];
    // Calculate duration from distance to next maze position
    duration = Math.max(Math.abs(Math.abs(MAZE_POSITIONS[0][0]) - Math.abs(MAZE_POSITIONS[1][0])), Math.abs(Math.abs(MAZE_POSITIONS[0][2]) - Math.abs(MAZE_POSITIONS[1][2]))) * 5 - 1;
    particleDirectionChange(npc.world, PARTICLE_PATH, duration, newPos[0], newPos[1], newPos[2], newMotion[0], newMotion[1], newMotion[2], 5, 5);
    npc.timers.forceStart(MOVE_PARTICLES, duration, false); // Start particle movement
    npc.timers.forceStart(STOP_MOVEMENT, 200, false); // Stop particle movememnt
}

function timer(event)
{
    var npc = event.npc;
    switch(event.id) {
        case(MOVE_PARTICLES):
            count++;
            if(MAZE_POSITIONS[count + 1 ] == null) { // Stop when maze is finished
                return;
            }
            // Calculate angle to next maze position
            var angle = getDirection(MAZE_POSITIONS[count][0], MAZE_POSITIONS[count][2], MAZE_POSITIONS[count + 1][0], MAZE_POSITIONS[count + 1][2]);
            newPos = MAZE_POSITIONS[count]
            motionX = -Math.cos(angle) * 0.2;
            motionZ = -Math.sin(angle) * 0.2;
            newMotion = [motionX, 0, motionZ];
            // Calculate duration from distance to next maze position
            duration = Math.max(Math.abs(Math.abs(MAZE_POSITIONS[count][0]) - Math.abs(MAZE_POSITIONS[count + 1][0])), Math.abs(Math.abs(MAZE_POSITIONS[count][2]) - Math.abs(MAZE_POSITIONS[count + 1][2]))) * 5 - 1;
            particleDirectionChange(npc.world, PARTICLE_PATH, duration, newPos[0], newPos[1], newPos[2], newMotion[0], newMotion[1], newMotion[2], 5, 5);
            npc.timers.forceStart(MOVE_PARTICLES, duration, false);
            break;
    }
    
}

/** Get direction to coordinates - Function by riken
 * @param {Double} npcx - Y coordinate of npc
 * @param {Double} npcz - Z coordinate of npc 
 * @param {Double} x - X coordinate of destination
 * @param {Double} z - Z coordinate of destination 
 * @returns 
 */
function getDirection(npcx, npcz, x, z) { 
    return Math.atan2(npcz-z, npcx-x)
}

/** Generate a random decimal number
 * @param {int} min - Minimum value to generate between 
 * @param {int} max - Maximum value to generate between
 * @param {int} decimalPlaces - Decimal places to round number to
 * @returns {Double} - random number between the min and max values with decimalPlaces amount of decimal places
 */
function genRand(min, max, decimalPlaces)
{  
    var rand = Math.random()*(max-min) + min;
    var power = Math.pow(10, decimalPlaces);
    return Math.floor(rand*power) / power;
}

/** Spawns a particle at a specific coordinates with a specific motion
 * @param {IWorld} world - World to spawn particle in
 * @param {String} particlePath - Path of particle texture to use
 * @param {int} timerDuration - Duration of the timer (I add +1 for timer delay just put in timer duration)
 * @param {Double} x - Initial x position to spawn particle at
 * @param {Double} y - Initial y position to spawn particle at
 * @param {Double} z - Initial z position to spawn particle at
 * @param {Double} mx - X motion of particle
 * @param {Double} my - Y motion of particle
 * @param {Double} mz - Z motion of particle
 * @param {int} particleWidth - Width of particle for sizing
 * @param {int} particleHeight - Height of particle for sizing
 */
function particleDirectionChange(world, particlePath, timerDuration, x, y, z, mx, my, mz, particleWidth, particleHeight)
{
    var particle = API.createParticle(particlePath);
    particle.setSize(particleWidth, particleHeight);
    particle.setPosition(x, y, z);
    particle.setMaxAge(timerDuration + 2);
    particle.setMotion(mx, my, mz, 0); // Gravity not supported
    particle.spawn(world)
}

/** Calculates new position based on motion and duration
 * @param {Double[]} oldPos - Old position to calculate new position from
 * @param {Double[]} oldMotion - Motion of particle from old position
 * @param {int} duration - How long particle was in motion for (1 is added to this in the function to account for timer delay)
 * @returns {Double[]} - New position of particle calculated from motion and duration
 */
function getNewPos(oldPos, oldMotion, duration)
{ // Calculates a new position assuming motion is full motion per tick e.g. if motion x was 1 in 10 ticks the particle travels 10 blocks in the x direction
    return [oldPos[0] + oldMotion[0] * (duration + 1), oldPos[1] + oldMotion[1] * (duration + 1), oldPos[2] + oldMotion[2] * (duration + 1)];
}
