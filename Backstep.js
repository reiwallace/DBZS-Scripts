/** Performs a backstep away from the target, backstepping to the center if the motion would result in collision with a wall
 * @param {ICustomNpc} npc - Npc performing backstep
 * @param {IEntity} target - Target to backstep away from
 * @param {Double} speed - Speed of backstep
 * @param {Double} height - Height to add to backstep
 * @param {Double[]} arenaCenter - Array for coordinates of arena center 
 */
function backstep(npc, target, speed, height, arenaCenter)
{
    if(target == null) return;
    var targetLookVector = target.getLookVector();
    // Boolean variable to check if the npc would hit a block from a backstep
    var wallCheck = npc.world.rayCastBlock(
        [npc.x, npc.y, npc.z], 
        [targetLookVector.XD, 0, targetLookVector.ZD], 
        speed * 6, true, false, false
    );
    if(wallCheck != null) { // Raycast to check if block in path
        // Backstep to middle
        var angle = getDirection(npc, arenaCenter[0], arenaCenter[2]);
        var x = -Math.cos(angle) * speed; 
        var z = -Math.sin(angle) * speed;
    } else { 
        // Backstep away from player
        var angle = getDirection(npc, target.getX(), target.getZ());
        var x = Math.cos(angle) * speed; 
        var z = Math.sin(angle) * speed;
    }
    npc.setMotion(x, height, z);
}

/** Gets a direction from an npc to another position
 * @param {ICustomNpc} npc - Npc to get direction from
 * @param {int} x - X position
 * @param {int} z - Z position
 * @returns {Double}
 */
function getDirection(npc, x, z)
{
    return Math.atan2(npc.getZ()-z, npc.getX()-x)
}
