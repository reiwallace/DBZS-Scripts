// GQ2_Whis.js
// AUTHOR: Noxie, Aredia

// COUNTER CONFIG
var counterChance = 0.2;
var counterDamageMultiplier = 2;
var counterSound = API.createSound("jinryuudragonbc:DBC4.block2");
var counterMessage = "My turn~";

// DODGE CONFIG
var dodgeChance = 0.7;
var dodgeAnimations = ["Dodge6", "Dodge7"];
var dodgeSounds = [];
for(var i = 1; i < 4; i++) dodgeSounds.push(API.createSound("jinryuudragonbc:DBC4.dodge" + i));

// SHADOW CLONE CONFIG
var cloneSummonSound = API.createSound("jinryuudragonbc:DBC4.blacktp");
var cloneMessage = "Clones";
var whisClone = {
  spawnChanceWhileAttacking: 0.25,
  cdTicks: 120,
  tab: 3,
  name: "WhisShadow(GQ2)",
  spawnPositions: [
    [[+2, 0], [-2, 0], [0, +2], [0, -2]],
    [[+2, +2], [-2, +2], [+2, -2], [-2, -2]],
    [[+3, 0], [-2, +2], [-2, -2]],
    [[3, 0], [1.5, 2.6], [-1.5, 2.6], [-3, 0], [-1.5, -2.60], [1.5, -2.6]]
  ]
}

// STRIKE OF REVELATION CONFIG
var baseSpeed = 16;
var strikeCooldown = 400; // CD in ticks
var strikeDamage = 0.75; // % of player hp
var strikeRange = 2;
var strikeTelegraphDuration = 30; // Telegraph in ticks
var strikeTelegraphMessage = "Strike Telegraph";
var strikeMessage = "Strike";

// TIMERS
var CLONE_ATTEMPT_CD = 0;
var STRIKE_OF_REVELATION = 1;
var STRIKE_OF_REVELATION_TELEGRAPH = 2;


// DON'T EDIT
var previousHp;
var previousValidHit;
var npcAnimHandler;

function init(event) 
{
  //NPC base stats
  var npc = event.npc;
  // npc.setMaxHealth(280000000);
  // npc.setHealth(npc.getMaxHealth());
  // npc.setMeleeStrength(900000);
  // npc.setRangedStrength(1300000);
  // npc.setCombatRegen(450000);
  // npc.setHealthRegen(900000);
  // npc.setMeleeSpeed(16);
  // npc.setSpeed(baseSpeed);

  // Counters and handlers
  previousHp = npc.getMaxHealth();
  previousValidHit = 0;
  npcAnimHandler = new lib.animationHandler(npc);
}

function damaged(event)
{
    var npc = event.npc;
    var timers = npc.timers;
    var target = event.getSource();
    var currentHp = npc.getHealth();

    // Start timers
    startTimers(timers);

    // Compare hp to evaluate hit damage, if the previous hit was a dodge use the last valid hit
    previousValidHit = previousHp == currentHp ? previousValidHit : previousHp - currentHp;
    previousHp = currentHp;

    var doDodge = Math.random() < dodgeChance;
    if(doDodge) { // Perform Dodge
        // Animation
        var animation = dodgeAnimations[lib.getRandom(0, dodgeAnimations.length - 1, true)]
        npcAnimHandler.setAnimation(animation);

        // Sound
        var sound = dodgeSounds[lib.getRandom(0, dodgeSounds.length - 1, true)];
        sound.setPosition(npc.getPosition())
        API.playSound(sound);

        event.setCancelled(true);
    } else { // Check Counter
        var doCounter = Math.random() < counterChance;
        if(!doCounter || !lib.isValidPlayer(target)) return;

        // Play counter sound
        counterSound.setPosition(npc.getPosition());
        API.playSound(counterSound);
        npc.say(counterMessage)

        // Do counter damage
        DBCAPI.doDBCDamage(target, DBCAPI.getDBCData(npc), Math.abs(previousValidHit * counterDamageMultiplier));
    }
}

function meleeAttack(event) {
  startTimers(event.npc.timers);
}

function timer(event)
{
  var npc = event.npc;

  // Don't perform attacks if target is not valid
  var target = npc.getAttackTarget();
  if(!lib.isValidPlayer(target)) return;
  

  switch(event.id) {
    case(STRIKE_OF_REVELATION_TELEGRAPH):
      npc.say(strikeTelegraphMessage);
      npc.timers.forceStart(STRIKE_OF_REVELATION, strikeTelegraphDuration, false);

      // Teleport Whis behind the player
      var targetLookVector = target.getLookVector();
      npc.setPosition(
        target.x + -targetLookVector.getXD() * 1.5, 
        target.y, 
        target.z + -targetLookVector.getZD() * 1.5
      );
      npc.setSpeed(0);

      var dbcTarget = target.getDBCPlayer();
      dbcTarget.setLockOnTarget(null);
      break;

    case(STRIKE_OF_REVELATION):
      npc.say(strikeMessage);
      // Get player in range
      var nearbyPlayers = npc.getSurroundingEntities(strikeRange, 1);

      // Do damage
      for(var i = 0; i < nearbyPlayers.length; i++) {
        var player = nearbyPlayers[i];
        if(!lib.isValidPlayer(player)) continue;
        var dbcTarget = player.getDBCPlayer();
        dbcTarget.setBody(dbcTarget.getBody() - dbcTarget.getMaxBody() * strikeDamage);
      }

      npc.setSpeed(baseSpeed);
      break;

    case(CLONE_ATTEMPT_CD):
      if(Math.random() > whisClone.spawnChanceWhileAttacking) return;
      npc.say(cloneMessage)
      // Spawn clones
      summonShadows(npc);

      // Play sound
      cloneSummonSound.setPosition(npc.getPosition())
      API.playSound(cloneSummonSound);
      break;
  }
}

function tick(event)
{
  lib.checkReset(event.npc);
}

/** Summons Whis shadow clones in predetermined positions around whis
 * @param {ICustomNpc} npc 
 */
function summonShadows(npc)
{
  var direction = getDir(npc);
  // Loop for predetermined positions
  for(var i = 0; i < whisClone.spawnPositions[direction].length; i++) {
    var pos = whisClone.spawnPositions[direction][i]
    npc.world.spawnClone(npc.x + pos[0], npc.y, npc.z + pos[1], whisClone.tab, whisClone.name);
  }
}

/** Gets an array index based on npc's rotation
 * @param {ICustomNpc} npc 
 * @returns Int
 */
function getDir(npc) {
  var rotation = Math.abs(npc.getRotation() % 360)
  return Math.floor(rotation / 90) % 4;
}

/** Starts ability timers that are not currently active
 * @param {ITimers} timers 
 */
function startTimers(timers)
{
  if(!timers.has(STRIKE_OF_REVELATION) && !timers.has(STRIKE_OF_REVELATION_TELEGRAPH)) timers.forceStart(STRIKE_OF_REVELATION_TELEGRAPH, strikeCooldown, false);
  if(!timers.has(CLONE_ATTEMPT_CD)) timers.forceStart(CLONE_ATTEMPT_CD, whisClone.cdTicks, false);
}