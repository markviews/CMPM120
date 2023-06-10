class Enemy extends Phaser.GameObjects.Sprite {

    constructor(scene, type, x, y, health, damage, isBoss = false) {
        super(scene, x, y);
        this.setDepth(2);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setImmovable(true);
        this.body.onCollide = true;
        this.play(`${type}_idle`);
        this.setScale(2.5);
        this.body.setSize(15, 15);
        
        this.stunned = false;
        this.maxHP = health;
        this.health = health;
        
        if (!isBoss) {
            this.on('animationcomplete', (anim) => {

                if (anim.key.endsWith('_die')) {
                    players[0].exp++;
                    this.destroy();
                } else {
                    this.play(type + '_idle');
                }
    
            });
        }
        
         // collide event
         scene.physics.world.on('collide', (gameObject1, gameObject2) => {
            if (gameObject2 != this) return;
            
            var player = players[gameObject1.id]

            // player getting hit by enemy
            if (gameObject1.name == "player") {
                if (this.stunned) return;
                if (player.stunned) return;
                
                player.stunned = true;
                player.sprite.play('fall');
                players[0].health -= damage;

                // knock player back
                var angle = Math.atan2(player.sprite.y - this.y, player.sprite.x - this.x);
                scene.physics.velocityFromRotation(angle, 100, player.sprite.body.velocity);

                setTimeout(() => {
                    player.stunned = false;
                }, 1000 * players[0].buffs.invulnTime);

                return;
            }

            // enemy getting hit by player's sword
            if (gameObject1.name == "melee_hitbox") {
                if (this.stunned) return;
                this.stunned = true;
                this.health -= player.meleeDamage * players[0].buffs.meleeDamage * players[0].buffs.damageBoost;
                if (this.health <= 0) {
                    this.play(type + '_die');
                    return;
                }
                if(this.stunned == true && !(this.flash && this.flash.isPlaying())) {
                    this.flash =  scene.tweens.add({
                            targets: this,
                            tint: 0xEE4B2B,
                            alpha: 1,
                            duration: 200,
                            yoyo: true,
                            onComplete: () => {
                                //this.alpha = 1;
                                this.setTint(0xFFFFFF);
                            },
                        });
                }

                if (!isBoss) {
                    var angle = Math.atan2(this.y - player.sprite.y, this.x - player.sprite.x);
                    scene.physics.velocityFromRotation(angle, 100, this.body.velocity);
                }

                setTimeout(() => {
                    if (!this || !this.body) return;
                    if (!isBoss) this.play(type + '_idle');
                    this.body.setVelocity(0, 0);
                    this.stunned = false;
                }, 1000);

                return;
            }
            
            // enemy getting hit by player's projectile
            if (gameObject1.name == "projectile") {

                this.health -= players[0].projectileDamage * players[0].buffs.projectileDamage * players[0].buffs.damageBoost;
                if (this.stunned) {
                    gameObject1.destroy();
                    return;
                }
                this.stunned = true;
                
                if (this.health <= 0) {
                    this.play(type + '_die');
                    return;
                }
                if(this.stunned == true && !(this.flash && this.flash.isPlaying())) {
                    this.flash =  scene.tweens.add({
                            targets: this,
                            tint: 0xEE4B2B,
                            alpha: 1,
                            duration: 200,
                            yoyo: true,
                            onComplete: () => {
                                //this.alpha = 1;
                                this.setTint(0xFFFFFF);
                            }
                    });
                }

                if (!isBoss) {
                    var angle = Math.atan2(this.y - gameObject1.y, this.x - gameObject1.x);
                    scene.physics.velocityFromRotation(angle, 10, this.body.velocity);
                }

                gameObject1.destroy();

                setTimeout(() => {
                    if (!this || !this.body) return;
                    if (!isBoss) this.play(type + '_idle');
                    this.body.setVelocity(0, 0);
                    this.stunned = false;
                }, 400);

                return;
            }
            
        });
    }
}