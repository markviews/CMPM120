const viewDistance = 1000;
const attackDistance = 100;

class Slime extends Enemy {

    constructor(scene, x, y) {
        let type = "slimeBlue";
        let health = 3;
        if (Math.random() > 0.5) {
            type = "slime"; // 50 % chance to spawn a green slime
            health = 2;
        }
        super(scene, type, x, y, health, 1);
        this.type = type;
        this.scene = scene;
        this.attackTick = 0;
        this.autoAttackTick = Phaser.Math.Between(1500, 2000);
    }

    update(time, delta) {

        this.attackTick += delta
        if (this.attackTick > this.autoAttackTick) {
            this.attackTick = 0;

            if (this.stunned) return;

            var player = this.scene.getNearestPlayer(this.x, this.y, viewDistance);
            if (player == null) return;
            if (!player.hasLineOfSight(this))  return;

            var distance = Phaser.Math.Distance.Between(this.x, this.y, player.sprite.x, player.sprite.y);
            if (distance < attackDistance) {
                this.play(`${this.type}_attack`);
            } else {
                this.play(`${this.type}_jump`);
            }

            // jump towards nearest player
            var angle = Math.atan2( player.sprite.y - this.y, player.sprite.x - this.x);
            this.scene.physics.moveTo(this, this.x + Math.cos(angle) * 30, this.y + Math.sin(angle) * 30, 30);

            // flip if to left of player
            angle *= (180/Math.PI);
            if (angle > 90 || angle < -90) this.flipX = false;
            else this.flipX = true;
        }

    }

}

class Hunger extends Enemy {

    constructor(scene, x, y) {
        super(scene, "hunger", x, y, 5, 4);
        this.scene = scene;
        this.attackTick = 0;
        this.autoAttackTick = Phaser.Math.Between(1500, 2000);
    }

    update(time, delta) {

        this.attackTick += delta
        if (this.attackTick > this.autoAttackTick) {
            this.attackTick = 0;

            if (this.stunned) return;

            var player = this.scene.getNearestPlayer(this.x, this.y, viewDistance);
            if (player == null) return;
            if (!player.hasLineOfSight(this))  return;

            var distance = Phaser.Math.Distance.Between(this.x, this.y, player.sprite.x, player.sprite.y);
            if (distance < attackDistance) {
                this.play(`hunger_attack`);
            } else {
                this.play(`hunger_move`);
            }

            // jump towards nearest player
            var angle = Math.atan2( player.sprite.y - this.y, player.sprite.x - this.x);
            this.scene.physics.moveTo(this, this.x + Math.cos(angle) * 30, this.y + Math.sin(angle) * 30, 30);

            // flip if to left of player
            angle *= (180/Math.PI);
            if (angle > 90 || angle < -90) this.flipX = false;
            else this.flipX = true;
        }

    }

}

class CyberJelly extends Enemy {

    constructor(scene, x, y) {
        super(scene, "cyberjelly", x, y, 7, 3);
        this.scene = scene;
        this.attackTick = 0;
        this.autoAttackTick = Phaser.Math.Between(1500, 2000);
    }

    update(time, delta) {

        this.attackTick += delta
        if (this.attackTick > this.autoAttackTick) {
            this.attackTick = 0;

            

            var player = this.scene.getNearestPlayer(this.x, this.y, viewDistance);
            if (player == null) return;
            if (!player.hasLineOfSight(this))  return;

            // jump towards nearest player
            var angle = Math.atan2( player.sprite.y - this.y, player.sprite.x - this.x);
            this.scene.physics.moveTo(this, this.x + Math.cos(angle) * 30, this.y + Math.sin(angle) * 30, 30);

            // flip if to left of player
            if (angle > 90 || angle < -90) this.flipY = true;
            else this.flipY = false;

            if (this.stunned) return;

            // flip if to left of player
            angle *= (180/Math.PI);
            if (angle > 90 || angle < -90) this.flipX = false;
            else this.flipX = true;
            
        }

    }

}

class Drone extends Enemy {

    constructor(scene, x, y) {
        super(scene, "drone", x, y, 5, 2);
        this.scene = scene;
        this.attackTick = 0;
        this.autoAttackTick = Phaser.Math.Between(1500, 2000);
    }

    update(time, delta) {

        var player = this.scene.getNearestPlayer(this.x, this.y, viewDistance);
        if (player == null) return;
        if (!player.hasLineOfSight(this))  return;

        // jump towards nearest player
        var angle = Math.atan2( player.sprite.y - this.y, player.sprite.x - this.x);
        var distance = Phaser.Math.Distance.Between(this.x, this.y, player.sprite.x, player.sprite.y);

        // flip if to left of player
        angle *= (180/Math.PI);
        if (angle > 90 || angle < -90) this.flipX = false;
        else this.flipX = true;

        if (distance > 500) {
            // set velicoty
            this.body.velocity.x = Math.cos(angle) * 30;
            this.body.velocity.y = Math.sin(angle) * 30;
        }

        this.attackTick += delta
        if (this.attackTick > this.autoAttackTick) {
            this.attackTick = 0;

            if (this.stunned) return;

            // projectile attack
            
            

        }

    }

}

class Boss extends Enemy {

    constructor(scene, x, y) {
        super(scene, "magister", x, y, 500, 1, true);
        this.scene = scene;
        
        this.convert = 0;
        this.convert2 = 0;
        this.seconds = 0;
        this.swords = 1;
        this.tele_seconds = 0;
        this.proj_delay = 1;
        this.distance = 200;
        this.state = 'normal'; //different states: normal, enhanced, enraged.
        
        //SOUND EFFECTS
        this.Mag_1 = scene.sound.add('Mag_1');
        this.Mag_1.setVolume(0.1);
        this.Mag_2 = scene.sound.add('Mag_2');
        this.Mag_2.setVolume(0.1);
        this.Mag1_cast = scene.sound.add('Mag_cast');
        this.Mag1_cast.setVolume(0.1);
        this.Boss_tele = scene.sound.add('Boss_tel');
        this.Boss_tele.setVolume(0.1);
        this.Boss_die = scene.sound.add('Boss_Death');
        this.Boss_die.setVolume(0.1);
        this.Boss_Explosion = scene.sound.add('Boss_Explosion');
        this.Boss_Explosion.setVolume(0.1);
        this.Mag2_cast = scene.sound.add('Mag2_cast');
        this.Mag2_cast.setVolume(0.1);
        //END SOUND EFFECTS

        this.on('animationcomplete', (anim) => {

            switch(anim.key) {
                case 'magister_teleport':
                    var {x, y} = scene.getRandSpawnPoint();
                    this.setPosition(x, y);
                    this.play('magister_TR');
                break;
                case 'magister_TR':
                    this.play('magister_idle');
                    this.tele_seconds = 0;
                    this.seconds = 0;
                    this.swords = 1;
                break;
                case 'magister_castMagic':
                    this.play('magister_MagicLoop');
                break;
                case 'magister_castSword':
                    if(this.state == 'normal'){
                        var Y = this.getPlayerY();
                        var X = this.getPlayerX();
                        this.castSword(this.swords, this.x, X, Y); //number of swords, current x of boss, Y of player X of player
                        this.play('magister_idle');
                    }
                    else if(this.state == 'enhanced' || this.state == 'enraged'){
                        //First normal sword
                        var Y = this.getPlayerY();
                        var X = this.getPlayerX();
                        this.castSword(1, this.x -200, X, Y); //number of swords, current x of boss, Y of player X of player
    
                        //Second sword
                        var distX = this.x - X;
                        var place = X - distX;
                        this.castSword(1, place + 200, X, Y); //number of swords, current x of boss, Y of player X of player
                        this.swords += 1;
                        this.play('magister_idle');
                    }
                break;
                case 'magister_die':
                    //DEATH PARTICLE
                    const deathEmitter = scene.add.particles('fire').createEmitter({
                        lifespan: 2000, // How long each particle should last (in milliseconds)
                        speed: { min: 200, max: 400 }, // Speed range for the particles
                        angle: { min: 0, max: 360 }, // Angle range for the particles
                        scale: { start: 1, end: 0 }, // Scale range for the particles
                        alpha: { start: 1, end: 0 }, // Alpha range for the particles
                        gravityY: 0, // The vertical gravity applied to the particles
                        quantity: 10, // Number of particles to be emitted per frame
                        blendMode: 'ADD', // The blending mode of the particles
                        repeat: 2, // Should the particles be emitted in a loop
                        frequency: 1000, // How often the particles should be emitted
                    });
                    deathEmitter.setPosition(this.x+75, this.y+100);
                    this.Boss_Explosion.play();
                    deathEmitter.explode(1000);
                    scene.bossIsHere = false;
                    this.destroy();
                break;
            }

        });

    }

    update(time, delta) {
        let scene = this.scene;

        //convert miliseconds to seconds
        if(this.convert != 1000) this.convert += delta;
        if(this.convert2 != 500) this.convert2 += delta;
        if(this.convert >= 1000) {
            this.convert = 0;
            this.seconds+=1;
            this.tele_seconds+=1;
        }

        let player_angle = Phaser.Math.Angle.Between(this.x, this.y, players[0].sprite.x, players[0].sprite.y);

        //set state
        if(this.health <= 250 && this.state == 'normal') this.state = 'enhanced';
        if(this.health <= 125 && this.state == 'enhanced') this.state = 'enraged';

        //Projectile Fire
        let animKey = this.anims.currentAnim.key;
        if(animKey == 'magister_MagicLoop') {
            if(this.seconds >= 10){
                this.seconds = 0;
            }
            if(this.convert2 >= 500){
                this.proj_delay += 1;
                this.convert2 = 0;
            }
            if(this.seconds >= 7){
                this.stop();
            }
            else if(this.proj_delay >= 1){
                //console.log("projectile fired");
                //console.log(player_angle);
                if(this.state == 'enraged'){
                    for(let i = 0; i < 6; i++){
                        var angle = player_angle + (i * 45);
                        this.castMagic(this.x, this.y, angle, scene);
                    }
                    this.proj_delay = 0;
                }
                else{
                    this.castMagic(this.x, this.y, player_angle, scene);
                    this.proj_delay = 0;
                }
            }    
            
        }

        //#region States

        //#region Normal
        if(this.state == 'normal'){
            if(this.tele_seconds >=20){
                this.tele_seconds = 0;
                this.play('magister_teleport');
                this.Boss_tele.play();
            }
            else if(this.seconds == 10 && animKey!= 'magister_teleport' && animKey!= 'magister_TR' && animKey!= 'magister_MagicLoop' && animKey!= 'magister_castMagic'){
                this.stop();
                this.play('magister_castMagic');
                this.Mag1_cast.play();
            }
            else if(this.seconds == 3 && animKey!= 'magister_teleport' && animKey!= 'magister_TR' && animKey!= 'magister_MagicLoop' && animKey!= 'magister_castSword'){
                this.stop();
                this.play('magister_castSword');
                this.Mag2_cast.play();
            }   
        }
        //#endregion Normal

        //#region Enhanced
        if(this.state == 'enhanced'){
            if(this.seconds == 3 && animKey!= 'magister_teleport' && animKey!= 'magister_TR' && animKey!= 'magister_MagicLoop' && animKey!= 'magister_castSword' && animKey!= 'magister_castMagic'){
                this.stop();
                this.play('magister_castSword');
                this.Mag2_cast.play();

            }
            else if(this.seconds >= 5 && animKey!= 'magister_teleport' && animKey!= 'magister_TR' && animKey!= 'magister_MagicLoop' && animKey!= 'magister_castSword' && animKey!= 'magister_castMagic'){
                this.stop();
                this.seconds = 0;
                this.play('magister_castMagic');
                this.Mag1_cast.play();

            }
            else if(this.tele_seconds >=12){
                this.tele_seconds = 0;
                this.play('magister_teleport');
                this.Boss_tele.play();
            }
        }
        //#endregion Enhanced

        //#region Enraged
        if(this.state == 'enraged'){
            if(this.seconds == 3 && animKey!= 'magister_teleport' && animKey!= 'magister_TR' && animKey!= 'magister_MagicLoop' && animKey!= 'magister_castSword' && animKey!= 'magister_castMagic' && animKey!= 'magister_die'){
                this.stop();
                this.play('magister_castSword');
                this.Mag2_cast.play();

            }
            else if(this.seconds >= 5 && animKey!= 'magister_teleport' && animKey!= 'magister_TR' && animKey!= 'magister_MagicLoop' && animKey!= 'magister_castSword' && animKey!= 'magister_castMagic' && animKey!= 'magister_die'){
                this.stop();
                this.seconds = 0;
                this.play('magister_castMagic');
                this.Mag1_cast.play();

            }
            else if(this.tele_seconds >=12 && animKey!= 'magister_die'){
                this.tele_seconds = 0;
                this.play('magister_teleport');
                this.Boss_tele.play();
            }
        }
        //#endregion Enraged
        //#endregion States
    }

    getPlayerX() {
        return players[0].sprite.x;
    }

    getPlayerY() {
        return players[0].sprite.y;
    }

    castMagic(x, y, player_angle, scene) {
        if (scene == null) return;
                let magic = scene.add.sprite(x, y);
                scene.physics.add.existing(magic);
                magic.play('magister_magic');
                this.Mag_1.play();
                magic.setScale(2.5);
                magic.body.setSize(15, 15);
                magic.body.setOffset(0,0);
                magic.setOrigin(0.5, 0.5);
                magic.body.onCollide = true;
                scene.projectile_enemy.add(magic);

                magic.name = "projectile";
                // could add other attribues like damage here

                
                magic.body.setImmovable(true);

                let projectileSpeed = 500;
                magic.body.setVelocity(Math.cos(player_angle) * projectileSpeed, Math.sin(player_angle) * projectileSpeed);
                magic.angle = Phaser.Math.RadToDeg(player_angle);
                var magX;
                var magY;
                if(magic.dir == "left"){
                    magX = magic.x - Math.cos(Phaser.Math.DegToRad(magic.angle)) * this.distance;
                    magY = magic.y + Math.sin(Phaser.Math.DegToRad(magic.angle)) * this.distance;
                }
                else if (magic.dir == "right"){
                    magX = magic.x + Math.cos(Phaser.Math.DegToRad(magic.angle)) * this.distance;
                    magY = magic.y + Math.sin(Phaser.Math.DegToRad(magic.angle)) * this.distance;
                }
                else if (magic.dir == "down"){
                    magX = magic.x + Math.cos(Phaser.Math.DegToRad(magic.angle)) * this.distance;
                    magY = magic.y - Math.sin(Phaser.Math.DegToRad(magic.angle)) * this.distance;
                }
                else{
                    magX = magic.x + Math.cos(Phaser.Math.DegToRad(magic.angle)) * this.distance;
                    magY = magic.y + Math.sin(Phaser.Math.DegToRad(magic.angle)) * this.distance;
                }
                for(let i = 0; i <= 30; i ++){
                    let clone = scene.add.sprite(magic.x, magic.y);
                    clone.setScale(6);
                    clone.setPosition(magic.x, magic.y);
                    clone.dir = magic.body.dir;
                    clone.play('Mag1_trail');
                    clone.alpha = 1;
    
                    scene.tweens.add({
                        targets: clone,
                        x: magX, // Move the sprite 100 pixels to the right
                        y: magY,
                        alpha: clone.alpha - 0.2 * i,
                        duration: 200 + 50 * i, // Half the duration for the first part of the dodge
                        repeat: 0, // Repeat the tween once to complete the dodge motion
                        onComplete: () => {
                            clone.destroy();
                        },
                    });
                }

                // destroy projectile after 1 second
                scene.time.delayedCall(5000, function() {
                    magic.destroy();
                });
    }

    castSword(swords, x,player_x ,player_y){
        if(swords >= 1){
            if (this.scene == null) return;
                let sword = this.scene.add.sprite(x, player_y);
                this.scene.physics.add.existing(sword);
                sword.play('magister_sword');
                this.Mag_2.play();
                sword.setScale(4);
                sword.body.setSize(20, 48);
                sword.body.setOffset(0,0);
                sword.setOrigin(0.5, 0.5);
                sword.body.onCollide = true;
                this.scene.projectile_enemy.add(sword);
                sword.name = "sword";
                var magX;
                var magY = 0;
                // could add other attribues like damage here
                sword.body.setImmovable(true);
                if(x > player_x){
                    sword.body.setVelocity(-600, 0);
                    magX = -700;
                    magY = sword.y;
                }
                else{
                    sword.body.setVelocity(600, 0);
                    magX = 2000;
                    magY = sword.y;
                }

            if(this.state == 'normal' || this.state == 'enhanced' || this.state == 'enraged'){
                for(let i = 0; i <= 1; i ++){
                    let clone = this.scene.add.sprite(sword.x, sword.y);
                    clone.setScale(4);
                    clone.setPosition(sword.x, sword.y);
                    clone.dir = sword.body.dir;
                    clone.play('magister_sword');
                    clone.alpha = 1;
    
                    this.scene.tweens.add({
                        targets: clone,
                        x: magX, // Move the sprite 100 pixels to the right
                        y: magY,
                        alpha: clone.alpha - 0.8 * i,
                        duration: 3000 + 100 * i, // Half the duration for the first part of the dodge
                        repeat: 0, // Repeat the tween once to complete the dodge motion
                        onComplete: () => {
                            clone.destroy();
                        },
                    });
                }
            }
                this.swords--;
                this.scene.time.delayedCall(5000, function() {
                    sword.destroy();
                });
        }
    }

}