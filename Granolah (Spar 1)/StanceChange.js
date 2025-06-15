/**
 * Handles the visual and audio effects for an NPC's stance change.
 *
 * @param {Object} npc - The NPC entity object, containing position and world information.
 * @param {Object} particle - The particle could be both a iParticle object or a particle identifier string(example: "snowshovel").
 * @param {boolean} iParticleBoolean - Determines if the particle is a iParticle object or a string identifier(true for iParticle, false for string identifier).
 * @param {number} particlesCount - The number of particles to generate.
 * @param {number} particleRadius - The radius within which to spawn particles around the NPC.
 * @param {string|null} sound - The identifier for the sound to play, or null if no sound. (example: "minecraft:ambient.weather.thunder")
 * @param {Object|null} player - The player entity to associate with the sound, or null if not applicable.
 */
function stanceChangeVisuals(npc, particle, iParticleBoolean, particlesCount, particleRadius, sound, player)
{
    var randomPoints = generateRandomPoints(npc.x, npc.y, npc.z, particleRadius, particlesCount)
    if (iParticleBoolean) {
        for (var i = 0; i < randomPoints.length; i++) {
            var point = randomPoints[i]
            particle.setPosition(point.x, point.y, point.z)
            particle.spawn(npc.world)
        }
    }
    else {
        for (var i = 0; i < randomPoints.length; i++) {
            var point = randomPoints[i]
            npc.world.spawnParticle(particle, point.x, point.y, point.z, Math.random(), Math.random(), Math.random(), 0.1, 1);
        }
    }

    if (sound == null || player == null) return;
    var soundPlayed = API.createSound(sound)
    soundPlayed.setEntity(player)
    API.playSound(1, soundPlayed)
    
}

/**
 * Generates an array of random points within a given radius around a central position.
 *
 * @param {number} x - The x-coordinate of the center point.
 * @param {number} y - The y-coordinate of the center point.
 * @param {number} z - The z-coordinate of the center point.
 * @param {number} radius - The radius within which to generate points.
 * @param {number} count - The number of random points to generate.
 * @returns {Array<{x: number, y: number, z: number}>} An array of point objects with x, y, and z properties.
 */
function generateRandomPoints(cx, cy, cz, radius, count)
{
    var points = []
    for (var i = 0; i < count; i++) {
        var theta = Math.random() * 2 * Math.PI
        var phi = Math.acos(2 * Math.random() - 1)
        var r = Math.random() * radius

        var x = cx + r * Math.sin(phi) * Math.cos(theta)
        var y = cy + r * Math.sin(phi) * Math.sin(theta)
        var z = cz + r * Math.cos(phi)

        points.push({ x: x, y: y, z: z })
    }
    return points
}