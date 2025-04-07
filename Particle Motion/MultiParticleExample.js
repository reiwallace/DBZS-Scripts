// MultiParticleExample.js
// AUTHOR: Noxie

var PARTICLE_PATH = "plug:textures/blocks/concrete_periwinkle.png";
var newPoses = new Array();
var newMotions = new Array();
var duration = 0;

// Timers
var MOVE_PARTICLES = 0;
var STOP_MOVEMENT = 1;

function interact(event)
{ // Starts particle movememnt on interacting with npc
    var npc = event.npc
    newPoses = [
        [npc.x, npc.y + 3, npc.z],
        [npc.x, npc.y + 4, npc.z],
        [npc.x, npc.y + 5, npc.z],
        [npc.x, npc.y + 6, npc.z],
        [npc.x, npc.y + 7, npc.z]
    ];
    newMotions = [
        [0.5, 0, 0.5],
        [-0.5, 0, -0.5],
        [0, 0, 0.5],
        [0.5, 0, 0],
        [0, 0, -0.5]
    ];
    duration = 5;
    for(i = 0; i < newPoses.length; i++) {
        particleDirectionChange(npc.world, PARTICLE_PATH, duration, newPoses[i][0], newPoses[i][1], newPoses[i][2], newMotions[i][0], newMotions[i][1], newMotions[i][2], 20, 20);
    }
    npc.timers.forceStart(MOVE_PARTICLES, duration, true); // Start particle movement
    npc.timers.forceStart(STOP_MOVEMENT, 200, false); // Stop particle movememnt
}

function timer(event)
{
    var npc = event.npc;
    switch(event.id) {
        case(MOVE_PARTICLES):
            for(i = 0; i < newPoses.length; i++) {
                newPoses[i] = getNewPos(newPoses[i], newMotions[i], duration); // Set new postion on global variable to be used for the next movement
                newMotions[i] = [genRand(-1, 1, 3), 0, genRand(-1, 1, 3)] // Save motion as a global variable to be iterated on later
                particleDirectionChange(npc.world, PARTICLE_PATH, duration, newPoses[i][0], newPoses[i][1], newPoses[i][2], newMotions[i][0], newMotions[i][1], newMotions[i][2], 20, 20);
            }
            break;
        case(STOP_MOVEMENT):
            npc.timers.clear();
            break;
    }
    
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