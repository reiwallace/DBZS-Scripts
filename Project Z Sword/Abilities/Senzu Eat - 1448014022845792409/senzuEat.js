/**
 * @file senzuEat.js
 * @description Z Sword Ability that healers player health and stamina
 * @author Noxiiie
 */

var senzuEat = {
    config : {
        passiveBuffId: 18,
        superBuffId: 19,
        stamDuration: 10,
        kiDuration: 5,
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
    },
    active : function(event) {
        if(!lib.isPlayer(event.player)) return;
        var player = event.player;
        var config = event.config;
        var dbcPlayer = player.getDBCPlayer();
        dbcPlayer.setBody(dbcPlayer.getMaxBody());
        dbcPlayer.setStamina(dbcPlayer.getMaxStamina());
        dbcPlayer.setKi(dbcPlayer.getMaxKi());
        if(event.super) {
            event.player.setTempData("senzuSuperData", config.level);
            API.getCustomEffectHandler().applyEffect(
                player, 
                config.superBuffId, 
                config.kiDuration, 
                event.zsword.getCustomAttribute(event.scalar)
            );
        }
    },
    passive : function(event) {
        // Only trigger on ability active events
        if(event.type != "abilityActive1" && event.type != "abilityActive2") return;
        if(!lib.isPlayer(event.player)) return;
        var config = event.config;
        event.player.setTempData("senzuPassiveData", config.level);
        API.getCustomEffectHandler().applyEffect(
            event.player, 
            config.passiveBuffId, 
            config.stamDuration, 
            parseInt(event.zsword.getCustomAttribute(event.scaler))
        );
    }
};

