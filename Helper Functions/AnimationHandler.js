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