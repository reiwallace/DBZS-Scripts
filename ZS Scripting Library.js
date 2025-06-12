//ZS Scripting Library! Functions used by a TON of npcs!
// PLEASE UPDATE ALL SCRIPTS ON GITHUB IF YOU MAKE ANY CHANGES
// IF YOU REMOVE ANY GLOBAL SCRIPT PLEASE MARK IT AS 'INACTIVE' ON THE GITHUB
// AUTHOR: Riken/Mighty/Noxie

//our object storing every single function
var libraryObject = {
    debugMessage: sendDebugMessage,
    animHandler: animationHandler
}

//gets the world with id 0, sagaworld
var world = API.getIWorld(0);
world.setTempData("library", libraryObject);

function sendDebugMessage(playerName, text) {
    API.getPlayer(playerName).sendMessage(text);
}

// Animation Handler class --------------------------------------------------------------------------

/**
 * @constructor
 * @param {IEntity} entity - Entity managed by animation handler
 */
function animationHandler(entity)
{
    if(!entity || (entity.getType() != 1 && entity.getType() != 2)) return;
    this.entity = entity;
    this.entityAnimData = entity.getAnimationData();
}

/** Set entity animation
 * @param {IAnimation / String} animation - IAnimation object or String name of animation
 */
animationHandler.prototype.setAnimation = function(animationName) 
{
    if(!animationName) return;
    if(typeof animation == "string") animation = API.getAnimations().get(animation);
    this.entityAnimData.setEnabled(true);
    this.entityAnimData.setAnimation(animation);
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

animationHandler.prototype.getAnimData = function() { return this.entityAnimData; }

// ---------------------------------------------------------------------------

// Npc form handler class --------------------------------------------------------------------------

function dbcDisplayHandler(npc, enabled)
{
    if(!npc) return;
    this.transformConfig();
    this.npc = npc;
    this.npcDisplay = DBCAPI.getDBCDisplay(npc);
    this.npcDisplay.setEnabled(enabled);
    this.npc.updateClient();
}

dbcDisplayHandler.prototype.transformConfig = function()
{
    this.updateFormDelay = 10; // Number of ticks from starting aura to updating form
    this.disableAuraDelay = 20; // Number of ticks from starting aura to disabling aura (generally around 10 after updating form looks good)
    this.ascendSound = "npcdbc:transformationSounds.GodAscend";
} 

dbcDisplayHandler.prototype.slowTransform = function(form)
{
    if(!form) return;
    this.npcDisplay.setEnabled(true);
    this.npcDisplay.transform(form);
    this.npc.updateClient();
}

dbcDisplayHandler.prototype.quickTransform = function(form)
{
    
}

dbcDisplayHandler.prototype.setForm = function(form)
{
    if(!form) return;
    this.npcDisplay.setForm(form);
    this.npc.updateClient();
}

dbcDisplayHandler.prototype.setAura = function(aura, active)
{
    if(!aura) return;
    this.npcDisplay.setAura(aura);
    this.npcDisplay.toggleAura(active);
    this.npc.updateClient();
}

dbcDisplayHandler.prototype.disable = function()
{
    this.npcDisplay.setEnabled(false);
    this.npc.updateClient();
}

dbcDisplayHandler.prototype.getNpcDisplay = function() { return this.npcDisplay; }

// ---------------------------------------------------------------------------