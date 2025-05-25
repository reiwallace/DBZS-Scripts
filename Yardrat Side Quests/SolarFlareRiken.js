var TELEGRAPH = 10; //TELEGRAPH
var TELEGRAPH_TIME = 10; //Timer Time = Ticks

var SOLAR_FLARE_START = 20;
var SOLAR_FLARE_END = 30

var COOLDOWN = 100 //COOLDOWN ID
var COOLDOWN_TIME = 600; //COOLDOWN Time

var DodonRayDamage = 210000; //Damage for Ki Attack
var DODON_RAY_COOLDOWN = 200;

function killed(event) {
  var npc = event.npc;
  npc.getTimers().stop(COOLDOWN); //Stop the COOLDOWN Timer on Death
}

function damaged(event) {
  var npc = event.npc;
  var MaxHealth = npc.getMaxHealth();
  if (npc.getHealth() <= MaxHealth * 0.5) { //Checks if NPC is under 50% HP
    //npc.say(npc.getTimers().size());
    // TODO 1: Assign npc.getTimers() to a variable to make the lines shorter
    if (!npc.getTimers().has(COOLDOWN) && !npc.getTimers().has(DODON_RAY_COOLDOWN)) {
      npc.getTimers().start(TELEGRAPH, TELEGRAPH_TIME, false);//Starts Timer
    }
  }
}

function timer(event) {
  var npc = event.npc;
  if (npc == null) { //Checks if there is even an npc
    return;
  }
  // TODO 2: Assign npc.getTimers() to a variable to make the lines shorter
  if (npc.getTimers().has(COOLDOWN)) {    //Condition if COOLDOWN Timer is active
    return;
  } else {
    switch (event.getId()) { //Checks for which Step (TELEGRAPHs)
        // Begin Solar
      case TELEGRAPH:
        var animData = npc.getAnimationData(); //Animation
        var anim = API.getAnimations().get("Solarflare"); //Animation
        animData.setEnabled(true); //Animation
        animData.setAnimation(anim); //Animation
        animData.updateClient(); //Animation
        npc.say("&eSolar");
        // TODO 3: If the 32 ticks should ever be configurable, put it in a variable I suppose
        npc.getTimers().start(SOLAR_FLARE_START, 32, false);//Starts Timer
        break;

        // Flare with Effects / Overlay
      case SOLAR_FLARE_START:
        var overlay = API.createCustomOverlay(1); //Create Overlay via API
        var player = npc.getAttackTarget();
        var Duration = 200; //Time in Ticks
        if (player == null) { //Checks if there is a Target
          return;
        }
        npc.say("&6&lFlare!");
        player.addPotionEffect(2, 10, 3, true); //Gives Player Slowness
        overlay.addTexturedRect(2, "https://imgur.com/2WtWpKI.png", 0, 0, 1920,
            1080); //Get the Overlay .png over link
        player.showCustomOverlay(overlay); //show Player Overlay
        npc.setTempData("SolarTarget", player.getName()); //Sets Tempdata to close it later | Needed if Player disconntect | Sends Playername
        npc.getTimers().start(SOLAR_FLARE_END, Duration, false); //Starts the Duration Timer for Solar Flare
        break;

        // Clear Solar Flare from Player
      case SOLAR_FLARE_END:
        if (npc.hasTempData("SolarTarget")) { //Checks if there is Tempdata
          var player = API.getPlayer(npc.getTempData("SolarTarget")); //Get Playername
          if (player == null) { // Check if they are online
            return;
          }
          player.closeOverlay(1); //Close Overlay
          npc.getTimers().start(COOLDOWN, COOLDOWN_TIME, false); //Start COOLDOWN Timer
        }
        break;
    }
  }
}

function attack(event) {
  var npc = event.npc;
  var player = event.getTarget();
  if (player == null) { //Checks if there is a Target
    return;
  }
  //npc.say(player);
  // TODO 4: Check if it should be COOLDOWN or DODON_RAY_COOLDOWN if this should shoot the Dodon Ray
  if (npc.getTimers().has(COOLDOWN)) { //Check if COOLDOWN_TIMEr is active
    return;
  }
  if (player.getPotionEffect(2) > -1) { //Gives the getPotionEffect the ID of the Effect to the function and if its over -1 the player has the effect
    var animData = npc.getAnimationData(); //Animation
    var anim = API.getAnimations().get("LeftHandKi"); //Animation
    animData.setEnabled(true); //Animation
    animData.setAnimation(anim); //Animation
    animData.updateClient(); //Animation
    npc.say("&eDodon Ray");
    npc.executeCommand("/dbcspawnki 3 1 " + DodonRayDamage + " 0 7 1 1 100 " + npc.getX() + " " + npc.getY() + " " + npc.getZ()); //Spawns Spiral (DodonRay)
    //npc.say("Ki");
    // TODO 5: Change 100 to the Timer constant above
    npc.getTimers().start(100, DODON_RAY_COOLDOWN, false); //Start COOLDOWN Timer
  }
}