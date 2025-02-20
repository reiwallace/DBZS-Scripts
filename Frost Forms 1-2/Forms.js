var baseDam = 10; // Base melee damage
var baseRegen = 10; // Base health regen
var movementSpeed = 7; // Boss movement speed
var formMulti = 1.5; // Form damage and regen multiplier
var arenaCenter = [-258, 56, -843]; // Spot npc is tped to when transforming
var resetTime = 600; // Time after last being damage that the npc resets
var transformPercent = 0.55; // Percent health the boss transforms at 
var formName = "FrostTransformation"; // Form used to give frost his aura

var transformText1 = "&b&lTransform text1"; // Line spoken at the beginning of transformation
var transformText2 = "&b&lTransform text2"; // Line spoken in the middle of transformation
var transformText3 = "&b&lTransform text3"; // Line spoken at the end of transformation

var count = 0;

function init(e) {
    var npc = e.npc;
    DBCAPI.getDBCDisplay(npc).transform(DBCAPI.getForm(formName)); // Ensure right aura is enabled
    npc.setTempData("Movement Speed", movementSpeed);
    npc.setTempData("Reset Time", resetTime)
    reset(npc); // Reset timers and form
}

function timer(e) { 
    var id = e.id;
    var npc = e.npc;
    if(id == 10) { // Reset boss after set amount of time
        reset(npc);
    } else if(id == 11) { // Transformation Animation
        if(!npc.timers.has(12)) { // Stop timer once transformation is complete
            npc.timers.stop(11);
        }
        if(npc.getTempData("Form") != 2) {
            npc.setSize(npc.getSize() + 1);  // Grow
            npc.playSound("jinryuudragonbc:DBC3.force", 100, 1);
        }
        if(count == 1) { // Say second line halfway through transforming
            npc.say(transformText2);
        }
        count++;
    } else if(id == 12) { // End transformation
        DBCAPI.getDBCDisplay(npc).setEnabled(false); // Disable aura
        npc.setSpeed(movementSpeed); // Let boss move again
        npc.setFaction(2); // Make boss targetable
        npc.say(transformText3);
        changeForm(npc, baseDam * formMulti, baseRegen * formMulti, 6, 2); // Change model
        npc.setTempData("Transforming", false);
        lightningSpam(npc);
    }
}

function damaged(e) { // Hp breakpoint detection
    var npc = e.npc;
    npc.timers.forceStart(10, resetTime, false); // Reset if not hit in a set amount of time
    if(npc.getHealth() < npc.getMaxHealth() * transformPercent && npc.getTempData("Form") == 1) { // P2 transformation
        npc.say(transformText1);
        npc.setX(arenaCenter[0]);
        npc.setY(arenaCenter[1]);
        npc.setZ(arenaCenter[2]);
        npc.setSpeed(0); // Make npc stand still
        npc.setFaction(0); // Make npc untargetable
        count = 0;
        DBCAPI.getDBCDisplay(npc).setEnabled(true); // Enable aura
        npc.setTempData("Transforming", true);
        npc.timers.forceStart(11, 50, true); // Grow timer
        npc.timers.forceStart(12, 200, false); // End transformation timer
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
    npc.setTempData("Transforming", false);
    npc.setSpeed(movementSpeed);
    npc.setFaction(2);
    for(i = 2; i < 12; i++) { // Resetting timers manually to keep poison reset
        npc.timers.stop(i);
    }
}

function changeForm(npc, melee, regen, size, form) { // Change npc's stats, model and temp data
    npc.setMeleeStrength(melee);
    npc.setCombatRegen(regen);
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