// GQ2_Whis.js
// AUTHOR: Noxie

// CONFIG
var dodgeChance = 0.7;
var counterChance = 0.2;
var counterDamageMultiplier = 2;

var counterSound = API.createSound("jinryuudragonbc:DBC4.block2");
var counterMessage = "My turn~";


var dodgeSounds = [];
for(var i = 1; i < 4; i++) dodgeSounds.push(API.createSound("jinryuudragonbc:DBC4.dodge" + i));

var previousHp;
var previousValidHit;

var whisClone = {
   spawnChanceWhileAttacking: 0.25,
   cdTicks: 120,
   tab: 3,
   name: "WhisShadow(GQ2)"
}



function init(event) 
{
   //NPC base stats
    var npc = event.npc;
    npc.setMaxHealth(280000000);
    npc.setHealth(npc.getMaxHealth());
    npc.setMeleeStrength(900000);
    npc.setRangedStrength(1300000);
    npc.setCombatRegen(450000);
    npc.setHealthRegen(900000);
    npc.setMeleeSpeed(16);
    npc.setSpeed(16);

    //Counters and timers
    previousHp = npc.getMaxHealth();
    previousValidHit = 0;

      // Helpers in temp data
  var API = {
    getDir: function () {
      var rot = npc.getRotation() % 360;
      if (rot > 180) rot -= 360;
      switch (true) {
        case rot >= -45 && rot <= 45: return 0;
        case rot >= 45 && rot <= 135: return 1;
        case rot >= -180 && rot <= -135 || rot >= 135 && rot <= 180: return 2;
        case rot >= -135 && rot <= -45: return 3;
      }
      return 0;
    },
   summonShadows: function () {
        var w = npc.getWorld();
        var cx = npc.getX();
        var cy = npc.getY();
        var cz = npc.getZ();

        switch (this.getDir()) {
          case 0: 
            w.spawnClone(cx + 2, cy, cz,     whisClone.tab, whisClone.name);
            w.spawnClone(cx - 2, cy, cz,     whisClone.tab, whisClone.name);
            w.spawnClone(cx,     cy, cz + 2, whisClone.tab, whisClone.name);
            w.spawnClone(cx,     cy, cz - 2, whisClone.tab, whisClone.name);
            break;

          case 1:
            w.spawnClone(cx + 2, cy, cz + 2, whisClone.tab, whisClone.name);
            w.spawnClone(cx - 2, cy, cz + 2, whisClone.tab, whisClone.name);
            w.spawnClone(cx + 2, cy, cz - 2, whisClone.tab, whisClone.name);
            w.spawnClone(cx - 2, cy, cz - 2, whisClone.tab, whisClone.name);
            break;

          case 2: 
            for (var i = 0; i < 6; i++) {
              var angle = (Math.PI * 2 / 6) * i;
              var ox = Math.cos(angle) * 3;
              var oz = Math.sin(angle) * 3;
              w.spawnClone(cx + ox, cy, cz + oz, whisClone.tab, whisClone.name);
            }
            break;

          case 3: 
            w.spawnClone(cx + 3, cy, cz,     whisClone.tab, whisClone.name);
            w.spawnClone(cx - 2, cy, cz + 2, whisClone.tab, whisClone.name);
            w.spawnClone(cx - 2, cy, cz - 2, whisClone.tab, whisClone.name);
            break;
        }
    }
  };

 npc.setTempData("API", API);
}

function damaged(event)
{
    var npc = event.npc;
    var target = event.getSource();
    var currentHp = npc.getHealth();

    //Dodging animations
    var dodge1 = event.API.getAnimations().get("Dodge6");
    var dodge2 = event.API.getAnimations().get("Dodge7");

    // Compare hp to evaluate hit damage, if the previous hit was a dodge use the last valid hit
    previousValidHit = previousHp == currentHp ? previousValidHit : previousHp - currentHp;
    previousHp = currentHp;

    var doDodge = lib.getRandom(0, 1) < dodgeChance;
    if(doDodge) { // Perform Dodge
        var animData = npc.getAnimationData();
        animData.setEnabled(true);
        var sound = dodgeSounds[lib.getRandom(0, dodgeSounds.length - 1, true)];
        animData.setAnimation(Math.random() > 0.5 ? dodge1 : dodge2);
        animData.updateClient();
        sound.setPosition(npc.getPosition())
        API.playSound(sound);

        event.setCancelled(true);
    } else { // Check Counter
        var doCounter = lib.getRandom(0, 1) < counterChance;
        if(!doCounter || !lib.isValidPlayer(target)) return;

        // Play counter sound
        counterSound.setPosition(npc.getPosition());
        API.playSound(counterSound);
        npc.say(counterMessage)

        // Do counter damage
        DBCAPI.doDBCDamage(target, DBCAPI.getDBCData(npc), previousValidHit * counterDamageMultiplier);
    }
}

function tick(event)
{
    var cloneCD   = Number(event.npc.getStoredData("cloneCD")   || 0) + 1;
    lib.checkReset(event.npc);

    var API = event.npc.getTempData("API");

    var tgt = event.npc.getAttackTarget();
    if (tgt && event.npc.isAttacking() && cloneCD >= whisClone.cdTicks) {
    if (Math.random() < whisClone.spawnChanceWhileAttacking) {
      API.summonShadows();
      event.npc.executeCommand("playsound jinryuudragonbc:DBC4.blacktp " + tgt.getName() + " " + event.npc.x + " " + event.npc.y + " " + event.npc.z + " 1 1 1");
      cloneCD = 0;
    }
  }
  event.npc.setStoredData("cloneCD", cloneCD);
}