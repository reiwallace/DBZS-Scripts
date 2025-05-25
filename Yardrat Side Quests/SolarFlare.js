// CONFIG
// DODON RAY CONFIG
var DODON_RAY_DAMAGE = 210000; // Damage for Ki Attack
var DODON_RAY_COOLDOWN_TIME = 200; // Duration of dodon ray cooldown in ticks
var DODON_ANIMATION = "LeftHandKi"; // Nameof dodon ray animation

// SOLAR FLARE CONFIG
var SOLAR_FLARE_TELEGRAPH_TIME = 10; // Duration of solar flare telegraph in ticks
var SOLAR_FLARE_COOLDOWN_TIME = 600; // Duration of solar flare cooldown in ticks
var SOLAR_FLARE_START_DELAY = 32; // Delay from telegraph to starting solar flare attack in ticks
var SOLAR_FLARE_ANIMATION = "Solarflare"; // Name of solar flare animation
var SOLAR_FLARE_DURATION = 200; // Duration of solar flare effect in ticks
var SOLAR_FLARE_OVERLAY_ID = 1; // ID of overlay used during solar flare
var SOLAR_FLARE_OVERLAY_LINK = "https://imgur.com/2WtWpKI.png"; // Image to place on player's screen during solar flare

// TIMERS
var TELEGRAPH = 10; 
var SOLAR_FLARE_START = 20;
var SOLAR_FLARE_END = 30;
var SOLAR_FLARE_COOLDOWN = 100;
var DODON_RAY_COOLDOWN = 200;

// DON'T EDIT
var npcAnimHandler;
var attacking;

function init(event)
{
  attacking = false;
  npcAnimHandler = new animationHandler(event.npc);
}

function killed(event)
{
  //Stop the SOLAR_FLARE_COOLDOWN Timer on Death
  event.npc.timers.stop(SOLAR_FLARE_COOLDOWN);
}

function damaged(event)
{
  var npc = event.npc;
  var timers = npc.timers;

  // Check if npc is below 50% health and doesn't have any cooldown timers
  var timerChecks = Boolean(
    npc.getHealth() <= npc.getMaxHealth() * 0.5 &&
    !timers.has(SOLAR_FLARE_COOLDOWN) &&
    !attacking
  );
  // Start telegraph timer
  if(!timerChecks) return;
  timers.forceStart(TELEGRAPH, SOLAR_FLARE_TELEGRAPH_TIME, false);
  attacking = true;
}

function timer(event)
{
  var npc = event.npc;
  var timers = npc.timers;
  if (timers.has(SOLAR_FLARE_COOLDOWN)) return; //Condition if SOLAR_FLARE_COOLDOWN Timer is active

  switch (event.id) {
    case TELEGRAPH: // Begin solar flare
      // Telegraph ability and set attacking statet to true
      npcAnimHandler.setAnimation(SOLAR_FLARE_ANIMATION);
      npc.say("&eSolar");
      timers.start(SOLAR_FLARE_START, SOLAR_FLARE_START_DELAY, false);
      break;

    case SOLAR_FLARE_START: // Flare with Effects / Overlay
      var overlay = API.createCustomOverlay(SOLAR_FLARE_OVERLAY_ID); //Create Overlay via API
      var player = npc.getAttackTarget();
      if(player == null) {
        attacking = false;
        return;
      }

      // Add effects and overlay to player
      npc.say("&6&lFlare!");
      player.addPotionEffect(2, 10, 3, true);
      overlay.addTexturedRect(2, SOLAR_FLARE_OVERLAY_LINK, 0, 0, 1920, 1080); //Get the Overlay .png over link
      player.showCustomOverlay(overlay);

      // Sets temp data of player name incase of dc and starts duration timer
      npc.setTempData("SolarTarget", player);
      timers.start(SOLAR_FLARE_END, SOLAR_FLARE_DURATION, false);
      break;

    case SOLAR_FLARE_END: // Clear Solar Flare from Player
      // Close overlay if player is not null
      if(npc.hasTempData("SolarTarget") && npc.getTempData("SolarTarget") != null) npc.getTempData("SolarTarget").closeOverlay(SOLAR_FLARE_OVERLAY_ID);

      // Reset attack state and start cooldown timer
      attacking = false;
      timers.start(SOLAR_FLARE_COOLDOWN, SOLAR_FLARE_COOLDOWN_TIME, false);
      break;
  }
}

function attack(event)
{
  var npc = event.npc;
  var player = event.getTarget();

  // Return if conditions are not met to fire dodon ray
  var cantFireDodon = Boolean(
    player == null ||
    attacking ||
    npc.timers.has(DODON_RAY_COOLDOWN) ||
    player.getPotionEffect(2) > -1
  );
  if(cantFireDodon) return;

  // Fire dodon ray and start cooldown
  npcAnimHandler.setAnimation(DODON_ANIMATION);
  npc.say("&eDodon Ray");
  npc.executeCommand("/dbcspawnki 3 1 " + DODON_RAY_DAMAGE + " 0 7 1 1 100 " + npc.getX() + " " + npc.getY() + " " + npc.getZ()); //Spawns Spiral (DodonRay)
  npc.timers.start(DODON_RAY_COOLDOWN, DODON_RAY_COOLDOWN_TIME, false);
}

// Animation Handler class --------------------------------------------------------------------------

/**
 * @constructor
 * @param {IEntity} entity - Entity managed by animation handler
 */
function animationHandler(entity)
{
    this.entity = entity;
    this.entityAnimData = entity.getAnimationData();
}

/** Set entity animation
 * @param {String} animationName - Animation name as appears in game
 */
animationHandler.prototype.setAnimation = function(animationName) 
{
    this.entityAnimData.setEnabled(true);
    this.entityAnimData.setAnimation(API.getAnimations().get(animationName));
    this.entityAnimData.updateClient();
}

/** Removes animation, setting player back to their default animation
 */
animationHandler.prototype.removeAnimation = function()
{
    this.entityAnimData.setEnabled(false);
    this.entityAnimData.setAnimation(null);
    this.entityAnimData.updateClient();
}

// ---------------------------------------------------------------------------