var target;
var nextRush
var arenaCentre = [-320, 56, -812];
var npcInMotion;

var RUSH_PART1 = 1;
var RUSH_PART2 = 2;
var RUSH_PART3 = 3;
var RUSH_END = 4;
var RUSH_MOTION = 5;

var kiBlast = DBCAPI.createKiAttack(
    5, // Type
    4, // Speed
    1, // Damage
    false, 18, 0, true, 100 // Effect, colour, density, sound, charge
);

function interact(event) {
    var npc = event.npc;
    target = event.player;
    npc.timers.forceStart(1, 0, false);
}

function timer(event) {
    var npc = event.npc;
    var timers = npc.timers;
    switch(event.id){
        case(RUSH_PART1):
            performRush(npc, [target.x, target.y + 6, target.z], RUSH_PART2, 0, 2, 0);
            break;
        
        case(RUSH_PART2):
            performRush(npc, [arenaCentre[0], target.y + 2, arenaCentre[2]], RUSH_PART3, 3, 2, 3);
            break;

        case(RUSH_PART3):
            performRush(npc, [arenaCentre[0] + 5, target.y - 100, arenaCentre[2] + 5], RUSH_END, 5, 4, 5);
            break;

        case(RUSH_END):
            npc.setPitch(90);
            DBCAPI.fireKiAttack(npc, kiBlast);
            break;

        case(RUSH_MOTION):
            // Npc charges at player
            npcInMotion = true;
            timers.forceStart(RUSH_MOTION, 0, true);
            var npcMotion = lib.get3dDirection([npc.x, npc.y, npc.z], [target.x, target.y, target.z]);
            npc.setMotion(npcMotion[0] * 3, npcMotion[1] * 3 , npcMotion[2] * 3);
            break;
    }
}

function collide(event)
{
    var npc = event.npc;
    if(!npcInMotion) return;
    npc.setMotion(0, 0, 0);
    npc.timers.stop(RUSH_MOTION);
    npc.timers.forceStart(nextRush, 0, false);
    npcInMotion = false;
}

function performRush(npc, nextPos, nextTimer, speedx, speedy, speedz) 
{
    if(!lib.isPlayer(target)) return;
    target.getDBCPlayer().setTurboState(false);
    target.getDBCPlayer().setFlight(false);
    // Launch player into the ground
    var playerMotion = lib.get3dDirection([target.x, target.y, target.z], [nextPos[0], nextPos[1], nextPos[2]]);
    target.setMotion(playerMotion[0] * speedx, playerMotion[1] * speedy , playerMotion[2] * speedz);


    nextRush = nextTimer;
    npc.playSound("jinryuudragonbc:DBC2.strongpunch", 1, 1);
    if(nextTimer == RUSH_END) {
        npc.setMotion(0, 1, 0);
        npc.timers.forceStart(RUSH_END, 20, false);
        return;
    }
    npc.timers.forceStart(RUSH_MOTION, 5, true);
}
