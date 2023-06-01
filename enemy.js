class Enemy extends Phaser.GameObjects.Sprite {

    constructor(scene, type, x, y, health) {
        super(scene, x, y, type);
        this.scene = scene;
        this.type = type;
        this.health = health;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setCollideWorldBounds(true);
        this.body.setImmovable(true);
        this.body.onCollide = true;
        this.play(`${this.type}_idle`);
        
        this.stunned = false;
        this.setScale(2.5);
        this.body.setSize(15, 15);
        
        this.on('animationcomplete', (anim) => {

            if (anim.key.endsWith('_die')) {
                this.destroy();
            } else {
                this.play(this.type + '_idle');
            }

        });
        
         // collide event
         scene.physics.world.on('collide', (gameObject1, gameObject2) => {
            if (gameObject2 != this) return;
            if (this.stunned) return;
            
            var player = players[gameObject1.id]

            // player getting hit by enemy
            if (gameObject1.name == "player") {
                
                player.stunned = true;
                player.sprite.play('fall');
                player.health--;

                // knock player back
                var angle = Math.atan2(player.sprite.y - this.y, player.sprite.x - this.x);
                scene.physics.velocityFromRotation(angle, 100, player.sprite.body.velocity);

                setTimeout(() => {
                    player.stunned = false;
                }, 400);

                return;
            }

            // enemy getting hit by player's sword
            if (gameObject1.name == "melee_hitbox") {
                this.stunned = true;
                this.health--;

                // knockback
                var angle = Math.atan2(this.y - player.sprite.y, this.x - player.sprite.x);
                scene.physics.velocityFromRotation(angle, 100, this.body.velocity);

                if (this.health <= 0) {
                    this.play(this.type + '_die');
                    return;
                }

                setTimeout(() => {
                    this.body.setVelocity(0, 0);
                    this.play(this.type + '_idle');
                    this.stunned = false;
                }, 400);


                if (this.health <= 0) {
                    this.play(this.type + '_die');
                    return;
                }

                setTimeout(() => {
                    this.body.setVelocity(0, 0);
                    this.play(this.type + '_idle');
                    this.stunned = false;
                }, 400);

                return;
            }
            
            // enemy getting hit by player's projectile
            if (gameObject1.name == "projectile") {
                this.stunned = true;
                this.health--;

                // knockback
                var angle = Math.atan2(this.y - gameObject1.y, this.x - gameObject1.x);
                scene.physics.velocityFromRotation(angle, 10, this.body.velocity);
                //gameObject1.destroy();

                if (this.health <= 0) {
                    this.play(this.type + '_die');
                    return;
                }

                setTimeout(() => {
                    this.body.setVelocity(0, 0);
                    this.play(this.type + '_idle');
                    this.stunned = false;
                }, 400);


                if (this.health <= 0) {
                    this.play(this.type + '_die');
                    return;
                }

                setTimeout(() => {
                    this.body.setVelocity(0, 0);
                    this.play(this.type + '_idle');
                    this.stunned = false;
                }, 400);

                return;
            }
            
        });
    }
}