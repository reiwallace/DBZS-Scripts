/**
 * @file senzuEat.js
 * @description Z Sword Ability that healers player health and stamina
 * @author Noxiiie
 */

var config = {
    passiveBuffId: 18,
    superBuffId: 19,
    stamDuration: 100,
    kiDuration: 100,
    level : {
        1 : {ki: 100, stam: 100},
        2 : {ki: 100, stam: 100},
        3 : {ki: 100, stam: 100},
        4 : {ki: 100, stam: 100},
        5 : {ki: 100, stam: 100},
        6 : {ki: 100, stam: 100},
        7 : {ki: 100, stam: 100},
        8 : {ki: 100, stam: 100},
        9 : {ki: 100, stam: 100},
        10 : {ki: 100, stam: 100},
        11 : {ki: 100, stam: 100},
        12 : {ki: 100, stam: 100},
        13 : {ki: 100, stam: 100},
        14 : {ki: 100, stam: 100},
        15 : {ki: 100, stam: 100},
        16 : {ki: 100, stam: 100},
        17 : {ki: 100, stam: 100},
        18 : {ki: 100, stam: 100},
        19 : {ki: 100, stam: 100},
        20 : {ki: 100, stam: 100},
    }
};


function active(event) {
    if(!lib.isPlayer(event.player)) return;
    var player = event.player;
    var dbcPlayer = player.getDBCPlayer();
    dbcPlayer.setBody(dbcPlayer.getMaxBody());
    dbcPlayer.setStamina(dbcPlayer.getMaxStamina());
    if(event.super) {
        API.getCustomEffectHandler().applyEffect(
            player, 
            config.superBuffId, 
            config.kiDuration, 
            config.level[event.zsword.getCustomAttribute(event.scaler)].ki
        );
    }
}

function passive(event) {
    // Only trigger on ability active events
    if(event.type != "abilityActive1" && event.type != "abilityActive2") return;
    API.getCustomEffectHandler().applyEffect(
        event.player, 
        config.passiveBuffId, 
        config.stamDuration, 
        config.level[event.zsword.getCustomAttribute(event.scaler)].stam
    );
}