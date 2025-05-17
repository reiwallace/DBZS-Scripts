var KI_PUSH_RANGE = 10;
var KI_PUSH = 0;

function interact(event)
{
    event.npc.timers.forceStart(KI_PUSH, 1, true);
}

function timer(event)
{
    var npc = event.npc;
    switch(event.id) {
        case(KI_PUSH):
            kiPush(npc, KI_PUSH_RANGE);
            break;
    }
}

function kiPush(npc, kiPushRange)
{
    var pushTargets = npc.getSurroundingEntities(kiPushRange);
    for(var i in pushTargets) {
        if(pushTargets[i] == null) continue;
        // Find direction to target
        var direction = {
            x: npc.x - pushTargets[i].x,
            y: npc.y - pushTargets[i].y,
            z: npc.z - pushTargets[i].z
        }
        // Calculate distance and if target is further than max distance
        var length = Math.sqrt(Math.pow(direction.x, 2) + Math.pow(direction.y, 2) + Math.pow(direction.z, 2)); //we calculate the length of the direction
        if(length > kiPushRange) continue;
        // Calculate direction to push target
        var direction = [
            (direction.x / length), 
            (direction.y / length), 
            (direction.z / length)
        ];
        // Move the target
        pushTargets[i].setMotion(
            -direction[0] * (kiPushRange - length)/8, 
            -direction[1] * (kiPushRange - length)/8, 
            -direction[2] * (kiPushRange - length)/8
        );
    }
}