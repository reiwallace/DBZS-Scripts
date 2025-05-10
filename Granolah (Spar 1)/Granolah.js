// Granolah.js
// AUTHOR: Noxie, Delka, XO

// Backstep configurables
var BACKSTEP_SPEED = 1; // Speed of backstep motion
var BACKSTEP_HEIGHT = 0.2; // Height of backstep motion
var ARENA_CENTRE = [0, 0, 0]; // Point to backstep to if the npc would collide with a wall
var BACKSHOT_DURATION = 40; // Amount of time to perform all backshots
var BACKSHOT_COUNT = 100; // Number of backshots to perform after backstepping
var recoil1Name = "Recoil1";

// Attack checks
var performingStanceChange = false;
var performingQTE = false;
var performingBackshots = false;

var target;
var recoil = null;

// Timers
var BACKSTEP = 0;
var BACKSHOTS = 1;

function timer(event)
{
    var npc = event.npc;
    switch(event.id) {
        case(BACKSTEP):
            // Perform backstep and start backshots timer
            if(performingQTE) return;
            backstep(npc, target, BACKSTEP_SPEED, BACKSTEP_HEIGHT, ARENA_CENTRE);
            recoil = null;
            npc.timers.forceStart(BACKSHOTS, BACKSHOT_DURATION/BACKSHOT_COUNT, true);
            break;
        case(BACKSHOTS):
            // Shoot at the player and perform recoil animation
            var recoilAnimation = null;
            if(performingQTE) {
                // Stop firing to perform quick time event
                npc.timers.stop(BACKSHOTS);
                return;
            }
            // Cycle through recoil animations
            if(recoil == null) { 
                recoilAnimation = API.getAnimations().get(recoil1Name);
                recoil = true;
            }
            else recoilAnimation = recoil ? API.getAnimations().get(recoil2Name) : API.getAnimations().get(recoil3Name);
            // NYI
            recoil = !recoil;
            break;
    }
}

function target(event)
{ // Set target and begin reset timer on target
    var npc = event.npc;
    target = event.getTarget();
    if(!npc.timers.has(KI_BLAST_TELEGRAPH)) { // Start timers if not active
        npc.timers.forceStart(KI_BLAST_TELEGRAPH, kiBlastCooldown, true); // Start ability timer
        npc.timers.forceStart(BEGIN_ASSIST, assistAbilityCooldown, true);
    }
}

function meleeAttack(event)
{ // Begin reset timer on swing
    event.npc.timers.forceStart(RESET, resetTime, false);
}

function damaged(event)
{ // Begin reset timer on damaged
    event.npc.timers.forceStart(RESET, resetTime, false);
}

function killed(event)
{ // Reset if killed
    reset(event.npc);
}

function kills(event)
{ // Reset if killing a player and no other players around
    var npc = event.npc;
    var playerCheck = npc.getSurroundingEntities(50, 1);
    if(playerCheck.length < 1) reset;
}

/** Resets npc's timers and temp data
 * @param {ICustomNpc} npc - Npc to reset
 */
function reset(npc)
{
    npc.timers.clear();
}

/** Performs a backstep away from the target, backstepping to the center if the motion would result in collision with a wall
 * @param {ICustomNpc} npc - Npc performing backstep
 * @param {IEntity} target - Target to backstep away from
 * @param {Double} speed - Speed of backstep
 * @param {Double} height - Height to add to backstep
 * @param {Double[]} arenaCenter - Array for coordinates of arena center 
 */
function backstep(npc, target, speed, height, arenaCenter)
{
    if(target == null) return;
    var targetLookVector = target.getLookVector();
    // Boolean variable to check if the npc would hit a block from a backstep
    var wallCheck = npc.world.rayCastBlock(
        [npc.x, npc.y, npc.z], 
        [targetLookVector.XD, 0, targetLookVector.ZD], 
        speed * 6, true, false, false
    );
    if(wallCheck != null) { // Raycast to check if block in path
        // Backstep to middle
        var angle = getDirection(npc, arenaCenter[0], arenaCenter[2]);
        var x = -Math.cos(angle) * speed; 
        var z = -Math.sin(angle) * speed;
    } else { 
        // Backstep away from player
        var angle = getDirection(npc, target.getX(), target.getZ());
        var x = Math.cos(angle) * speed; 
        var z = Math.sin(angle) * speed;
    }
    npc.setMotion(x, height, z);
}

/** Gets a direction from an npc to another position
 * @param {ICustomNpc} npc - Npc to get direction from
 * @param {int} x - X position
 * @param {int} z - Z position
 * @returns {Double}
 */
function getDirection(npc, x, z)
{
    return Math.atan2(npc.getZ()-z, npc.getX()-x)
}