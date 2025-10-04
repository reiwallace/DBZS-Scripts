// Piccolo.js
// Author: Noxie

// CHANGE THESE
var arenaCentre = [0, 0, 0];
var baseMovementSpeed = 5;

// CONFIG
var specialBeamCannon = {
    attack: DBCAPI.createKiAttack(
        4, // Type of attack
        0, // Speed of attack
        100, // Damage of attack
        false,
        7, // Colour
        0, true, 100
    ),
    chargeSound: API.createSound("jinryuudragonbc:DBC2.deathball_charge"),
    chargeTime: 200, // Time player has to hit the correct clone in ticks
    animation: "PiccoloBeam"
}

var multiForm = {
    cloneName: "Piccolo(Multi-Form)",
    cloneTab: 1,
    telegraphMessage: "&a&lPiccolo begins charging a powerful attack",
    cooldown: 400, // Cooldown of the attack in ticks
    telegraphDuration: 20,
    positions: [[-6, -4, 0, 4, 6, 4, 0, -4],
                [0, -4, -6, -4, 0, 4, 6, 4]]
}

var stunDuration = 80; // Duration of stun in ticks

// Create particle
var beamTelegraphParticle = API.createParticle("plug:textures/items/artifacts/dark_orb.png");
beamTelegraphParticle.setSize(16, 16);
beamTelegraphParticle.setMaxAge(particleFrequency + 2);
beamTelegraphParticle.setHEXColor(16747008, 16761600, 0, 1);
beamTelegraphParticle.setAnim(1, true, 0, 6);
beamTelegraphParticle.setScale(13, 13, 0, 0);
var particleFrequency = 2;

// TIMERS  
var MULTI_FORM = 1;
var FIRE_BEAM = 2;
var STUN = 3;
var MULTI_FORM_TELEGRAPH = 4;
var CHARGE_PARTICLES = 5;

// DON'T CHANGE
var chargingAttack;
var stunned;
var multiForms;
var npcAnimHandler;

function init(event)
{ 
    var npc = event.npc;
    npc.timers.clear();

    // Reset variables to default
    chargingAttack = false;
    stunned = false;
    npc.setSpeed(baseMovementSpeed);
    npcAnimHandler = new lib.animationHandler(npc);
    npcAnimHandler.removeAnimation();

    // Check for leftover clones on init
    var cloneScan = npc.getSurroundingEntities(50, 0);
    for(var i in cloneScan) {
        if(cloneScan[i] == null || cloneScan[i].getName() != multiForm.cloneName) continue;
        cloneScan[i].despawn();
    }
}

function timer(event)
{
    var npc = event.npc;
    var target = npc.getAttackTarget();
    switch(event.id) {
        case(MULTI_FORM): // Starts telegraph for multiform attack
            if(!lib.isValidPlayer(target)) return;
            npc.timers.forceStart(MULTI_FORM_TELEGRAPH, multiForm.telegraphDuration, false);
            target.sendMessage(multiForm.telegraphMessage); 
            break;

        case(MULTI_FORM_TELEGRAPH): // End of telegraph
            multiFormAttack(npc, arenaCentre);
            break;

        case(FIRE_BEAM): // Fire beam at the end of timer
            endAttack();
            npc.setSpeed(baseMovementSpeed);
            DBCAPI.fireKiAttack(npc, specialBeamCannon.attack);
            break;

        case(CHARGE_PARTICLES): // Spawn charging particles
            // Stop timer if no longer charging 
            if(!npc.timers.has(FIRE_BEAM)) {
                npc.timers.stop(CHARGE_PARTICLES);
                return;
            }
            spawnParticle(npc);
            break;

        case(STUN): // Stun for duration of timer
            npc.setSpeed(baseMovementSpeed);
            stunned = false;
            break;
    }
}

function meleeAttack(event)
{ 
    // Begin reset timer on swing
    var npc = event.npc;
    startTimers(npc.timers);
    if(stunned) event.setCancelled(true);
}

function damaged(event)
{ 
    // Begin reset timer on damaged
    var npc = event.npc;
    var timers = npc.timers;
    startTimers(timers);

    // Despawn clones and start stun when hit during attack
    if(!chargingAttack) return;
    endAttack();
    stunned = true;
    timers.stop(FIRE_BEAM);
    timers.forceStart(STUN, stunDuration, false);
}

function tick(event)
{
    lib.checkReset(event.npc);
}

function killed(event)
{ // Reset if killed
    var npc = event.npc;
    npc.getTimers().clear();
    npc.reset();
}

function kills(event)
{ // Reset if killing a player and no other players around
    var npc = event.npc;
    npc.getTimers().clear();
    npc.reset();
}

/** Starts relevant attack timers
 * @param {ITimers} timers - Npc timers
 */
function startTimers(timers)
{
    if(!timers.has(MULTI_FORM) && !timers.has(FIRE_BEAM) && !timers.has(STUN)) { 
        // Start timers if not active
        timers.forceStart(MULTI_FORM, multiForm.cooldown, false);
    }
}

/** Creates 7 clones of the npc and begins charging an attack
 * @param {ICustomNpc} npc - Real npc
 * @param {int[]} arenaCentre
 */
function multiFormAttack(npc, arenaCentre)
{  
    // Defines targets and clone positions
    target = npc.getAttackTarget();
    multiForms = new Array();
    var piccoloPos = lib.getRandom(0, 8, true);

    // Spawn clones in relative spots
    for(i = 0; i < 8; i++) { 
        if(i == piccoloPos) continue;
        spawnMultiForm(npc.world, multiForm.positions[0][i] + arenaCentre[0], arenaCentre[1], multiForm.positions[1][i] + arenaCentre[2]);
    } 
    
    // Teleport Piccolo to his position
    npc.setX(multiForm.positions[0][piccoloPos] + arenaCentre[0]); 
    npc.setY(arenaCentre[1]);
    npc.setZ(multiForm.positions[1][piccoloPos] + arenaCentre[2]);
    
    // Start telegraph
    npc.timers.forceStart(FIRE_BEAM, specialBeamCannon.chargeTime, false);
    npc.timers.forceStart(CHARGE_PARTICLES, particleFrequency, true);
    npc.setSpeed(0);
    // Audio and Visuals
    npcAnimHandler.setAnimation(specialBeamCannon.animation);
    specialBeamCannon.chargeSound.setPosition(npc.getPosition());
    API.playSound(specialBeamCannon.chargeSound);
    chargingAttack = true;
}

/** Spawns a multiclone form then push
 * @param {IWorld} world - World to spawn npc in
 * @param {Double} relx - X position to spawn clone at
 * @param {Double} rely - Y position to spawn clone at
 * @param {Double} relz - Z position to spawn clone at
 */
function spawnMultiForm(world, relx, rely, relz)
{ 
    // Spawns clone then pushes to array
    var clone = world.spawnClone(relx, rely, relz, multiForm.cloneTab, multiForm.cloneName, false);
    var cloneAnimHandler = new lib.animationHandler(clone);
    cloneAnimHandler.setAnimation(specialBeamCannon.animation);
    if(clone != null) multiForms.push(clone);
}

/** Despawns all clones spawned piccolo's last attack 
 */
function endAttack()
{
    chargingAttack = false;
    npcAnimHandler.removeAnimation();
    for(var i in multiForms) {
        if(multiForms[i] == null) continue;
        multiForms[i].despawn();
    }
}

/** Spawns a particle at npc's head
 * @param {ICustomNpc} npc - Npc to spawn particle at
 */
function spawnParticle(npc)
{
    // Calculate particle position
    var angle = npc.getRotation();
    var dx = -Math.sin(angle*Math.PI/180) * 0.3;
    var dz = Math.cos(angle*Math.PI/180) * 0.3;
    beamTelegraphParticle.setPosition(dx+npc.x, npc.y+1.8, dz+npc.z);

    // Spawn particle
    beamTelegraphParticle.spawn(npc.world);
}
