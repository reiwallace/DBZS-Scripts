// Tuning knobs
var khhDam = 5000;
var bpMulti = 5; 
var explodeDam = 10000;

var target;
var increment = 0;
var oldAggro = 0;
var dpsRace = false;
var raceHpGoal = 0;
var aDeck = new Array();
var clones = new Array();
var bombs = new Array();

function damaged(event) { // Set target and check SB breakpoint
    target = event.source;
    if(dpsRace == true && raceHpGoal > event.npc.getHealth()) {
        removeSB(event.npc, true);
    }
} 

function init(event) { // Start ability timer
    var n = event.npc;
    event.npc.timers.forceStart(10, 200, true);
}

function timer(event) {
    var n = event.npc;
    var id = event.id;
    if(id == 10 && target != null) {
        decideAttack(event);
    } else if(id == 11) { // Kamehameha telegraph
        n.say("&b&lHa!");
        n.playSound("jinryuudragonbc:DBC.hamehafire", 100, 1);
        n.setRangedStrength(khhDam);
        n.setBurstCount(2);
        n.setFireRate(2);
        n.timers.forceStart(12, 1, true);
    } else if(id == 12) { // Kamehameha cast
        khh(n);
    } else if(id == 13) { // Big Punch telegraph
        n.say("&4&lHYAAA!");
        n.playSound("jinryuudragonbc:DBC.ha", 100, 1);
        bigPunch(n);
        n.setFireRate(2);
    } else if(id == 14) { // Big Punch finish
        n.setMeleeStrength(n.getTempData("dam"));
        n.setKnockback(0);
        n.setFireRate(1);
    } else if(id == 15) { // Spirit bomb time out
        removeSB(n, false);
    } 
}

function decideAttack(event) { // Function to decide which attack to use
    var n = event.npc;
    
    function getRandomInt(min, max) {  // Get a random number
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    function newDeck(n) { // Create new deck to get abilities from
        var Deck = new Array();
        switch(n.getAggroRange()) {
            case 40:
                return Deck = [0, 1];
            case 41:
                return Deck = [0, 1, 2];
            case 42:
                return Deck = [0, 3];
        }
    }
    
    function removeItem(array, item) { // Remove ability from the deck
        var index = array.indexOf(item);
        if (index !== -1) {
            array.splice(index, 1);
        }
        return array;
    }
    
    if(aDeck.length == 0 || oldAggro != n.getAggroRange()) { // Create deck if current one is empty
        aDeck = newDeck(n);
    }
    oldAggro = n.getAggroRange();
    var ability = aDeck[getRandomInt(0, aDeck.length-1)]; // Pull ability from deck
    aDeck = removeItem(aDeck, ability);
    if(n.getFireRate() == 1) { // Check if already casting
        switch(ability) { // Use random Ability
            case 0: // Kamehameha
                n.say("&b&lKame");
                n.say("&b&lHame");
                n.timers.forceStart(11, 20, false);
                break;
            case 1: // Big punch
                n.say("&4&lTake this!");
                n.timers.forceStart(13, 20, false);
                break;
            case 2: // Spiritbomb combo
                if(target != null) {
                    target.sendMessage("&f&lPlease, everyone... give me some of your energy.");
                }
                n.playSound("jinryuudragonbc:DBC3.cspiritbombt", 100, 1);
                target.getDBCPlayer().setLockOnTarget(null);
                n.setSpeed(0);
                n.setKnockbackResistance(2);
                n.setFireRate(2);
                n.setCombatRegen(0);
                sbCombo(n);
                break;
            case 3: // Instant transmission combo
                n.say("&4&cCan you keep up with this?!");
                n.playSound("jinryuudragonbc:DBC3.teleport", 100, 1);
                n.playSound("jinryuudragonbc:DBC.expl", 100, 1);
                n.setFireRate(2);
                ITCombo(n);
                break;
        }
    }
}

function khh(n) { // Shoot kamehameha projectiles
    var item = API.createItem("plug:energyBlock", 7, 1);
    var item2 = API.createItem("plug:energyBlock", 1, 1);
    if(target != null) {
        for(i = 0; i < 3; i++) {
            n.shootItem(target, item, 60);
            n.shootItem(target, item2, 60);
        }
    }
    increment++;
    if(increment > 20) {
            n.timers.stop(12);
            increment = 0;
            n.setFireRate(1); // Allow transformations
    }
}

function bigPunch(n) { // A punch with larger knockback and damage
    n.setMeleeStrength(parseInt(n.getTempData("dam") * bpMulti));
    n.setKnockback(4000);
    n.timers.forceStart(14, 30, false);
}

function sbCombo(n) {  // Solar flare into clones and spirit bomb
    clones = new Array();
    bombs = new Array();
    var gokuPos = getRandomInt(0, 7);
    var xRel = [-6, -4, 0, 4, 6, 4, 0, -4];
    var zRel = [0, -4, -6, -4, 0, 4, 6, 4];
    
    function getRandomInt(min, max) {  // Get a random number
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    function spawnAfterImage(n, relx, relz) { // Spawn afterimages and bombs (thx trent)
        var clone = n.world.spawnClone(relx, 56, relz, 1, "Goku (Clone)");
        var bomb = n.world.spawnClone(relx, 59, relz, 1, "SB");
        if(clone == null) return;
        if(bomb == null) return;
        clone.setMaxHealth(1);
        clone.setMeleeStrength(0);
        clone.setSpeed(0);
        bombs.push(bomb);
        clones.push(clone);
    }

    function solarFlare(n) { // Solar Flare attack
        if(target != null) {
            target.sendMessage("&e&lSOLAR FLARE!");
            target.addPotionEffect(15, 2, 2, true);
        }
    }

    solarFlare(n);
    if(target != null) { // Tp player to center
        targetName = target.getName();
        n.executeCommand("/tp " + targetName + " -260 57 -840");
    }


    for(i = 0;i < 8; i++) { // Spawn clones in relative spots
        if(i != gokuPos) { 
            spawnAfterImage(n, xRel[i] + -260, zRel[i] + -840);
        }
    } 
    // Move goku and his bomb into a random position
    bombs.push(n.world.spawnClone(xRel[gokuPos] + -260, 59, zRel[gokuPos] + -840, 1, "SB Real"));
    
    n.setX(xRel[gokuPos] + -259.5); 
    n.setY(56);
    n.setZ(zRel[gokuPos] + -839.5);
    
    n.timers.forceStart(15, 140, false);
    dpsRace = true;
    raceHpGoal = n.getHealth() - n.getMaxHealth() * 0.05;
}

function removeSB(n, castBreak) {
    for(i = 0; i < clones.length; i++) { // Try to delete all clones spawned by sb attack.
        if(clones[i] != null) {
            clones[i].despawn();
        }
        if(bombs[i] != null) {
            bombs[i].despawn();
        }
    }
    if(castBreak && bombs[7] != null) {
        bombs[7].despawn();
    }
    n.timers.stop(15);
    n.setSpeed(7);
    n.setFireRate(1);
    n.setKnockbackResistance(1);
    n.setCombatRegen(1000);
}

function ITCombo(n) { // Instant transmission explosion attack
    if(target != false) {
        var angle = target.getRotation();
        var x = target.getX();
        var z = target.getZ();
        var y = target.getY();
        var dx = -Math.sin(angle*Math.PI/180); // AAAA MATH
        var dz = Math.cos(angle*Math.PI/180);

        n.setX(x+dx*-0.5);
        n.setY(y);
        n.setZ(z+dz*-0.5);

        target.hurt(explodeDam);
        n.world.spawnParticle("largeexplode", x, y, z, 1, 1, 1, 0, 20);
        n.setFireRate(1);
    }
}