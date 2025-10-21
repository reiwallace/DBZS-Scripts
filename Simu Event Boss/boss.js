// SHADOW CLONE CONFIG
var cloneMessage = "Clones";
var whisClone = {
  cdTicks: 600,
  tab: 1,
  name: "Corrupt Data [RPGWep Event]",
  pos : [[5, 0], [0, 5], [0, -5], [-5, 0]]
}

var baseSpeed = 7;

var clones = [];
var percentFlags = {
    75: false,
    50: false,
    25: false
};

// Splash melee damage onto nearby players
function meleeAttack(event) {
    var npc = event.npc;
    var nearby = npc.getSurroundingEntities(30, 1);
    for(var entity in nearby) {
        entity = nearby[entity];
        if(!lib.isValidPlayer(entity)) return;
        var dbcEntity = entity.getDBCPlayer();
        dbcEntity.setBody(dbcEntity.getBody() - dbcEntity.getMaxBody() * ((1 - npc.getHealth() / npc.getMaxHealth()) / 8));
    }
}

function damaged(event) {
    var npc = event.npc;
    // Boss is immune to damage while adds are alive
    var nearby = npc.getSurroundingEntities(50, 2);
    for(var clone in nearby) {
        clone = nearby[clone]
        if(clone && clone.getName() == "Corrupt Data" && clone.getHealth() > 0) {
            event.setCancelled(true);
            return;
        };
    }

    if(!npc.timers.has(1)) npc.timers.forceStart(1, whisClone.cdTicks, false);
    if(npc.getMaxHealth() * 0.75 > npc.getHealth() && !percentFlags[75]) {
        summonShadows(npc);
        percentFlags[75] = true;
        npc.say("&5&l&kCORRUPT");
    }
    if(npc.getMaxHealth() * 0.5 > npc.getHealth() && !percentFlags[50]) {
        summonShadows(npc);
        percentFlags[50] = true;
        npc.say("&5&l&kMULTIPLYYY");
    }
    if(npc.getMaxHealth() * 0.25 > npc.getHealth() && !percentFlags[25]) {
        summonShadows(npc);
        percentFlags[25] = true;
        npc.say("&5&l&kSYSTEM FAILURE");
    }
    
    npc.setSpeed(baseSpeed);
}

/** Summons Whis shadow clones in predetermined positions around whis
 * @param {ICustomNpc} npc 
 */
function summonShadows(npc)
{
    clones = [];
    npc.setSpeed(0);
    // Loop for predetermined positions
    for(var i = 0; i < 4; i++) {
        var pos = whisClone.pos[i]
        clones.push(npc.world.spawnClone(npc.x + pos[0], npc.y + 5, npc.z + pos[1], whisClone.tab, whisClone.name));
    }
}

function killed(event) {
    
}