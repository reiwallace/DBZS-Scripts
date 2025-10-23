var teamUp = {

    teamKiStats : {
        type: 4,
        speed: 3,
        damage: 1000000, //base damage
        effect: 1,
        color: 2,
        density: 1,
        sound: 1,
        size: 100,
        willFactor: 0.5,
        spiFactor: 0.6,
        lvlFactor: 0.3,
        dmgMulti: 20,
        chargeTimeWindow: 5, //seconds
        chargeCap: 2, //1 - 1x bonus damage, 2 -2x bonus damage
        teamUpCooldown: 50, //seconds
        teamUpChance: 0.5
    },
    npcStats : {
        knockbackResistance: 1.0, // 0.0 = -100% 1.0 = 0% 2.0 = 100%
        kiResistance: 0.3, //0.3 - takes only 30% incoming ki damage from entities different than a player, leave at 1.0 to not alter the damage
        meleeResistance: 0.5, //same as before
        chargeMessage: "&b@p! Give me your power, I'm &bgoing all out!!",
        fireMessage: "&e&lDUAL...KAMEHAMEHAAA!!!"
    },
    
    getTagFromPlayer: function getTagFromPlayer(player){
        return player.getMCEntity().getEntityData().func_74775_l("PlayerPersisted"); 
    },
    
    getStat: function getStat(playerTag, name){
        return playerTag.func_74762_e(name);
    },
    
    getDamage: function getDamage(player){
        if(player != null){
            var str = this.getStat(player, "jrmcStrI");
            var dex = this.getStat(player, "jrmcDexI");
            var con = this.getStat(player, "jrmcCncI");
            var wil = this.getStat(player, "jrmcWilI")*this.teamKiStats.willFactor;
            var spi = this.getStat(player, "jrmcCnsI")*this.teamKiStats.spiFactor;
            
            var damage = (wil+spi+((str+dex+con)*this.teamKiStats.lvlFactor))*this.teamKiStats.dmgMulti;
            
            return damage;
        }else{
            return 0;
        }
    },
    
    areNearbyPlayersCharging : function areNearbyPlayersCharging(){
        var player = npc.getSurroundingEntities(30,1); 
        var isCharging = "false";
        for(var i = 0; i < player.length; i++){
            if(this.getTagFromPlayer(player[i]).func_74779_i("jrmcStatusEff").contains("A")){
                isCharging = "true";
            }
        }

        return isCharging;
    },
    
    spawnKi: function spawnKi(damage, charge){
        var stat = this.teamKiStats;
        npc.executeCommand("/dbcspawnki "+stat.type+" "+stat.speed+" "+Math.round((damage*charge/(stat.size/100)+stat.damage))+" "+stat.effect+" "+stat.color+" "+stat.density+" "+stat.sound+" "+stat.size+" "+npc.x+" "+npc.y+" "+npc.z);
        return 0;
    },
    
    updateTick: function updateTick(){
        if(npc.isAlive()){
                if(npc.getStoredData("inProgress") == "true"){
                    var kiStats = this.teamKiStats;
                    if(npc.getStoredData("secondsPassed") <= kiStats.chargeTimeWindow*2){
                        npc.setStoredData("secondsPassed", npc.getStoredData("secondsPassed")+1);
                        if(this.areNearbyPlayersCharging()=="true"){
                            npc.setStoredData("secondsCharged", npc.getStoredData("secondsCharged")+1);
                        }
                    }else{
                            if(npc.getStoredData("secondsCharged") > 0){
                                var charge = npc.getStoredData("secondsCharged")/(kiStats.chargeTimeWindow/2);
                                var damage = this.getDamage(this.getTagFromPlayer(npc.getSurroundingEntities(30,1)[0]));
                                if(charge > kiStats.chargeCap)
                                    charge = kiStats.chargeCap;
                                this.spawnKi(damage, charge);
                                npc.say(this.npcStats.fireMessage);
                            }
                            npc.setStoredData("inProgress", "false");
                            npc.setStoredData("secondsPassed", 0);
                            npc.setStoredData("secondsCharged", 0);
                            npc.setStoredData("lastTimeAttempted", world.getTotalTime());
                            npc.clearPotionEffects();
                            npc.setKnockbackResistance(this.npcStats.knockbackResistance);
                    }
                }else{
                    if(world.getTotalTime()-npc.getStoredData("lastTimeAttempted") >= this.teamKiStats.teamUpCooldown*20){
                        if(Math.random() <= this.teamKiStats.teamUpChance){
                            npc.say(this.npcStats.chargeMessage);
                            npc.setStoredData("inProgress", "true");
                            npc.addPotionEffect(2, 3000, 255, true);
                            npc.setKnockbackResistance(2.0);
                        }else{
                            npc.setStoredData("lastTimeAttempted", world.getTotalTime());
                        }
                    }
                }
                
                npc.setStoredData("teamUp", this);
            }
        },
    
    damageTick: function damageTick(event){
        if(npc.getStoredData("inProgress") == "true")
            event.setDamage(event.getDamage()*0.3);
        if(event.getSource() != null && event.getSource().getType() != 1){
            switch(event.getType()){
                case "causeEnExplosion":
                    this.fixKiDamage(event);
                    break;
                case "EnergyAttack":
                    this.fixKiDamage(event);
                    break;
                default:
                    event.setDamage(event.getDamage()*this.npcStats.meleeResistance);
                    break;
            }
        }
    },
    
    deathEvent: function deathEvent(event){
        npc.clearStoredData();
    },
    
    attackEvent: function attackEvent(event){
        if(npc.getStoredData("inProgress") == "true")
            event.setCancelled(true);
    },
    
    fixKiDamage: function fixKiDamage(event){
        var dmg = event.getDamage()*this.npcStats.kiResistance;
        if(dmg >= npc.getHealth())
            npc.kill();
        else
            npc.setHealth(npc.getHealth()-dmg);
    }
    
};
if(npc.getStoredData("lastTimeAttempted")==null)
    npc.setStoredData("lastTimeAttempted", world.getTotalTime());
    
if(npc.getStoredData("secondsPassed")==null)
    npc.setStoredData("secondsPassed", 0);
    
if(npc.getStoredData("secondsCharged")==null)
    npc.setStoredData("secondsCharged", 0);
    
if(npc.getStoredData("inProgress")==null)
    npc.setStoredData("inProgress", "false");

npc.setTempData("teamUp", teamUp);

var teamUp = npc.getTempData("teamUp");
teamUp.updateTick();

var NPCKiResistance = 0.4;
var NPCMeleeResistance = 0.4;

function fixKiDamage(event){
    var dmg = event.getDamage()*NPCKiResistance;
    if(dmg >= npc.getHealth())
        npc.kill();
    else
        npc.setHealth(npc.getHealth()-dmg);
}
if(event.getSource() != null && event.getSource().getType() != 1){
    switch(event.getType()){
        case "causeEnExplosion":
            this.fixKiDamage(event);
            break;
        case "EnergyAttack":
            this.fixKiDamage(event);
            break;
        default:
            event.setDamage(event.getDamage()*NPCMeleeResistance);
            break;
    }

var teamUp = npc.getTempData("teamUp");teamUp.damageTick(event);
}

var teamUp = npc.getTempData("teamUp");
teamUp.deathEvent(event);

var teamUp = npc.getTempData("teamUp");
teamUp.attackEvent(event);