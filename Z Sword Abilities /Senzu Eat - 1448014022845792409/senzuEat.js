/**
 * @file senzuEat.js
 * @description Z Sword Ability that healers player health and stamina
 * @author Noxiiie
 */

var senzuConfig = {
    active : { // Values % of max stat
        healPercent : 100,
        staminaPercent: 100
    },
    passive : { 
        buffId : 1,
        maxBuffDuration : 5, // Duration in seconds 
    }
};

/** Handles active and passive for senzuEat
 * @param {IPlayer} player
 * @param {Boolean} active
 * @param {Double} potency
 */
function senzuEat(player, active, potency) {
    if(!lib.isPlayer(player)) return;
    if(active) {
        var dbcPlayer = player.getDBCPlayer();
        dbcPlayer.setBody(dbcPlayer.getMaxBody() * senzuConfig.active.healPercent * potency);
        dbcPlayer.setStamina(dbcPlayer.getMaxStamina() * senzuConfig.active.staminaPercent * potency);
    } else {
        API.getCustomEffectHandler().applyEffect(player, senzuConfig.passive.buffId, senzuConfig.passive.maxBuffDuration * potency);
    }
}