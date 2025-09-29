// GQ2_Whis.js
// AUTHOR: Noxie

// CONFIG
var dodgeChance = 0.7;
var counterChance = 0.2;
var counterDamageMultiplier = 2;

var counterSound = API.createSound("jinryuudragonbc:DBC4.block2");
var counterMessage = "&b&oWhis counters your attack.";
var dodgeSounds = [];
for(var i = 1; i < 4; i++) dodgeSounds.push(API.createSound("jinryuudragonbc:DBC4.dodge" + i));

var previousHp;
var previousValidHit;

function init(event) 
{
    previousHp = event.npc.getMaxHealth();
    previousValidHit = 0;
}

function damaged(event)
{
    var npc = event.npc;
    var target = event.getSource();
    var currentHp = npc.getHealth();

    // Compare hp to evaluate hit damage, if the previous hit was a dodge use the last valid hit
    previousValidHit = previousHp == currentHp ? previousValidHit : previousHp - currentHp;
    previousHp = currentHp;

    var doDodge = lib.getRandom(0, 1) < dodgeChance;
    if(doDodge) { // Perform Dodge
        var sound = dodgeSounds[lib.getRandom(0, dodgeSounds.length - 1, true)];
        sound.setPosition(npc.getPosition())
        API.playSound(sound);

        event.setCancelled(true);
    } else { // Check Counter
        var doCounter = lib.getRandom(0, 1) < counterChance;
        if(!doCounter || !lib.isValidPlayer(target)) return;

        // Play counter sound
        counterSound.setPosition(npc.getPosition());
        API.playSound(counterSound);
        target.sendMessage(counterMessage);

        // Do counter damage
        DBCAPI.doDBCDamage(target, DBCAPI.getDBCData(npc), previousValidHit * counterDamageMultiplier);
    }
}

function tick(event)
{
    lib.checkReset(event.npc);
}