var baseDam = 10; // Base melee damage
var baseRegen = 10; // Base health regen
var formMulti = 1.5; // Form damage multiplier
var arenaCenter = [-212, 56, -777]; // Spot npc is tped to when transforming
var increment = 0;

var transformText1 = "&b&lTransform text1"; // Line spoken at the beginning of transformation
var transformText2 = "&b&lTransform text2"; // Line spoken in the middle of transformation
var transformText3 = "&b&lTransform text3"; // Line spoken at the end of transformation

function init(e) {
    var npc = e.npc;
    var dbcNpc = DBCAPI.getDBCDisplay(npc);
    dbcNpc.transform(DBCAPI.getForm("FrostTransformation")); // Ensure right aura is enabled
    dbcNpc.setEnabled(false);
    changeForm(npc, baseDam, baseRegen, 5, 1); // Set to base form
    npc.timers.forceStart(10, 20, true);
}

function timer(e) { 
    var id = e.id;
    var npc = e.npc;
    if(id == 10) { // Used for checking player leaving

    } else if(id == 11) { // Transformation Animation
        if(!npc.timers.has(12)) {
            npc.timers.stop(11);
        }
        if(npc.getTempData("Form") != 2) {
            npc.setSize(npc.getSize() + 1);  // Grow
        }
        if(increment == 1) { // Say second line halfway through transforming
            npc.say(transformText2);
        }
        increment++;
    } else if(id == 12) { // End transformation
        DBCAPI.getDBCDisplay(npc).setEnabled(false); // Disable aura
        npc.setSpeed(7); // Let boss move again
        npc.setFaction(2); // Make boss targetable
        npc.say(transformText3);
        changeForm(npc, baseDam * formMulti, baseRegen * formMulti, 6, 2); // Change model
        lightningSpam(npc);
    }
}

function damaged(e) { // Hp breakpoint detection
    var npc = e.npc;
    var maxHp = npc.getMaxHealth();
    var currentHp = npc.getHealth();
    if(currentHp < maxHp * 0.50 && npc.getTempData("Form") == 1) { // P2 transformation
        npc.say(transformText1);
        npc.setX(arenaCenter[0]);
        npc.setY(arenaCenter[1]);
        npc.setZ(arenaCenter[2]);
        npc.setSpeed(0); // Make npc stand still
        npc.setFaction(0); // Make npc untargetable
        increment = 0;
        DBCAPI.getDBCDisplay(npc).setEnabled(true); // Enable aura
        npc.timers.forceStart(11, 50, true);
        npc.timers.forceStart(12, 200, false);
    }
}

function killed(e) { // Reset on dying
    reset(e.npc);
}

function kills(e) { // Reset on killing the player
    reset(e.npc);
}

function reset(npc) { // Revert to first form and clear timers
    changeForm(npc, baseDam, baseRegen, 5, 1);
    DBCAPI.getDBCDisplay(npc).setEnabled(false);
    npc.setSpeed(7);
    npc.setFaction(2);
    npc.timers.clear();
}

function changeForm(npc, melee, regen, size, form) { // Change npc's stats, model and temp data
    npc.setMeleeStrength(melee);
    npc.setHealthRegen(regen);
    npc.setSize(size);
    npc.setTempData("Form", form);
    npc.getModelData().setEntity("JinRyuu.DragonBC.common.Npcs.EntityFrost" + form);
    npc.setTexture("jinryuudragonbc:npcs/frost" + form + ".png"); // Apply new model's skin
}

function lightningSpam(npc) { // Transformation lighting animation
    function getRandomInt(min, max) {  // Get a random number
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    for(i = 0; i < 10; i++) { // Spam lightning in random spots nearby
        npc.world.thunderStrike(npc.x + getRandomInt(-3, 3), npc.y, npc.z + getRandomInt(-3, 3));
    }
}