var kiTelegraphDuration = 20;

var diskHealthThreshold = 0.3;

var attackCd = 300;

var DECIDE_ATTACK = 1;

var diskFlag = false;

function init(event) {
    var npc = event.npc;
    if(npc.getMaxHealth() == npc.getHealth()) {
        npc.timers.clear();
        npc.getActionManager().stop();
        diskFlag = false;
    }

    npc.timers.forceStart(DECIDE_ATTACK, attackCd, false);
}

function tick(event) {
    lib.checkReset(event.npc);
}

function damaged(event) {
    var npc = event.npc;
    if(npc.getHealth() - event.getDamage() > npc.getMaxHealth() * diskHealthThreshold && !diskFlag) return;
    diskFlag = true;
    destructoDisk(npc)
}

function timer(event) {
    var npc = event.npc;
    switch(event.id) {
        case DECIDE_ATTACK:
            if(lib.getRandom(0, 1, true) > 1) kiAttack(npc);
            else solarFlare(npc);
    }
}

function kiAttack(npc) {
    var am = npc.getActionManager();
    function kiTelegraph(act) {

    }

    function kiShoot(act) {

    }

    am.schedule("kiTelegraph", 1, kiTelegraph).
    after("kiShoot", kiTelegraphDuration, kiShoot)
    am.start();
}

function solarFlare(npc) {
    var am = npc.getActionManager();
    function flareTelegraph(act) {

    }

    function flareAttack(act) {
        
    }

    am.schedule("flareTelegraph", 1, flareTelegraph).
    after("flareAttack", kiTelegraphDuration, flareAttack)
    am.start();
}