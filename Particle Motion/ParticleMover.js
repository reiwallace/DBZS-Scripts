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
 */
function particleDirectionChange(world, particlePath, timerDuration, x, y, z, mx, my, mz)
{
    var particle = API.createParticle(particlePath);
    particle.setPosition(x, y, z);
    particle.setMaxAge(timerDuration + 1);
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