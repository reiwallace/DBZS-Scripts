// Tuning knobs
var kkDrain = 0.01; // Kaioken hp drain
var bDam = 1000; // Base melee
var fMulti = [1.5, 2]; // Form multis

var cHp = 0;
var mHp = 0;
var bPs = [true, true];
var forms = [DBCAPI.getForm("Goku ssjb"), DBCAPI.getForm("Goku ssjbkk"), DBCAPI.getForm("Goku ssj")];

function init(event) { // Initialise max hp and current hp variables
    var n = event.npc;
    var DBCn = DBCAPI.getDBCDisplay(n);
    cHp = n.getHealth();
    mHp = n.getMaxHealth();
    DBCn.transform(forms[2]); // Swap to base form
    DBCn.toggleAura(false);
    n.setTempData("dam", bDam);
    n.setAggroRange(40);
    n.setMeleeStrength(bDam);
    n.setKnockback(0);
    n.setFireRate(1);
    n.setSpeed(7);
    n.setKnockbackResistance(1);
    n.setCombatRegen(1000);
    n.timers.stop(0);
    bPs = [true, true];
}

function killed(event) {
    var n = event.npc;
    for(i = 0; i < 20; i++) {
        n.timers.stop(i);
    }
}

function timer(event) {
    var id = event.id;
    var n = event.npc;
    if(id == 0) { // Kaioken hp drain
        cHp = cHp - mHp * kkDrain;
        n.setHealth(cHp);
    }
}

function damaged(event) { // Hp breakpoint detection
    var n = event.npc;
    var DBCn = DBCAPI.getDBCDisplay(n);

    cHp = n.getHealth();
    if(cHp < mHp * 0.75 && bPs[0] && n.getFireRate() == 1) { // Ssjb transformation
        n.say("&b&lThis is getting interesting...");
        DBCn.transform(forms[0]); // Swap to ssjb form
        DBCn.toggleAura(false);
        n.setAggroRange(41); // Variable to be detected in other tabs
        n.setMeleeStrength(bDam * fMulti[0]);
        n.setTempData("dam", bDam * fMulti[0]);
        bPs[0] = false;
    }    else if(cHp < mHp * 0.20 && bPs[1] && n.getFireRate() == 1) { // Ssjbkk transformation
        n.say("&c&lI won't let you destroy my world!");
        event.npc.timers.stop(10);
        event.npc.timers.forceStart(10, 100, true);
        DBCn.transform(forms[1]); // Swap to ssjbkk form
        DBCn.toggleAura(true);
        n.setAggroRange(42); // Variable to be detected in other tabs
        n.timers.forceStart(0, 100, true);
        n.setMeleeStrength(bDam * fMulti[1]);
        n.setTempData("dam", bDam * fMulti[1]);
        bPs[1] = false;
    }   
}