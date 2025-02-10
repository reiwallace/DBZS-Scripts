var arenaCenter = [0, 26, 0]; 
var speed = 1; // Backstep speed
var height = 0.3; // Backstep height


function backstep(e) { // Make npc backstep but move towards center if it hits a wall.
    function getDirection(npc, x, z) { // Get direction to coordinates - Function by riken
        return Math.atan2(npc.getZ()-z, npc.getX()-x)
    }
    var npc = e.npc;
    var target = npc.getAttackTarget();
    if(target != null) {
        var targetLookVector = target.getLookVector();
    
        if(npc.world.rayCastBlock([npc.x, npc.y, npc.z], [targetLookVector.XD, 0, targetLookVector.ZD], speed * 6, true, false, false) != null) { // Raycast to check if block in path
            // Backstep to middle
            var angle = getDirection(npc, arenaCenter[0], arenaCenter[2]);
            var x = -Math.cos(angle) * speed; 
            var z = -Math.sin(angle) * speed;
        } else { // Backstep away from player
            var angle = getDirection(npc, target.getX(), target.getZ());
            var x = Math.cos(angle) * speed; 
            var z = Math.sin(angle) * speed;
        }
        npc.setMotion(x, height, z);
    }
}