var arenaCenter = [0, 26, 0]; 
var speed = 1; // Backstep speed
var height = 0.3; // Backstep height


function backstep(e) { // Make npc backstep but move towards center if it hits a wall.
    function getDirection(npc, x, z) { // Get direction to coordinates - Function by riken
        return Math.atan2(npc.getZ()-z, npc.getX()-x)
    }

    var n = e.npc;
    var tar = n.getSurroundingEntities(10, 1)[0];
    if(tar != null) {
        var tarLooking = tar.getLookVector();
    
        if(n.world.rayCastBlock([n.x, n.y, n.z], [tarLooking.XD, 0, tarLooking.ZD], speed * 6, true, false, false) != null) { // Raycast to check if block in path
            // Backstep to middle
            var angle = getDirection(n, arenaCenter[0], arenaCenter[2]);
            var x = -Math.cos(angle) * speed; 
            var z = -Math.sin(angle) * speed;
        } else { // Backstep away from player
            var angle = getDirection(n, tar.getX(), tar.getZ());
            var x = Math.cos(angle) * speed; 
            var z = Math.sin(angle) * speed;
        }
        n.setMotion(x, height, z);
    }
}