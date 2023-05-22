
const viewDistance = 500;
var bruh = [];

class Slime extends Phaser.GameObjects.Sprite {

    constructor(scene, x, y) {
        super(scene, x, y, 'slime');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.scene = scene;
        this.setScale(2.5);
        this.play('slime_idle');
        this.body.setSize(15, 15);
        this.setInteractive();

        this.body.setCollideWorldBounds(true);
        this.body.setBounce(0.2);
        this.body.setFriction(1);
        scene.physics.add.collider(this, scene.layer_tiles);

        this.health = 1000;
        this.stunned = false;

        // idle after jump
        this.on('animationcomplete', function (anim, frame) {
            this.stunned = false;
            this.body.setVelocity(0, 0);

            if (anim.key == 'slime_jump' || anim.key == 'slime_ouch') {
                this.play('slime_idle');
            }

            if (anim.key == 'slime_die') {
                console.log(`slime ${this.intervalID} died and was destroyed. health: ` + this.health);
                this.destroy();
            }
        });

        // each slime gets a random tick rate between 1.5 and 2 seconds
        this.intervalID = setInterval(this.jump.bind(this), Phaser.Math.Between(1500, 2000));
        
         // collide event
         scene.physics.world.on('collide', (gameObject1, gameObject2, body1, body2) => {
            if (gameObject2 != this) return;
            if (gameObject1.name != "melee_hitbox") return;
            
            var playerID = gameObject1.id;
            var player = players[playerID]
            
            // skip if currently being knocked back
            if (this.knockback != null && this.knockback.isPlaying()) {
                return;
            }

            this.stunned = true;
            this.health--;
            
            if (this.health <= 0) {
                this.play('slime_die');
            } else {
                this.play('slime_ouch');
            }

            // knock slime back
            var angle = Math.atan2(this.y - player.sprite.y, this.x - player.sprite.x);
            scene.physics.velocityFromRotation(angle, 100, this.body.velocity);
        });

    }

    jump() {
        if (this.stunned) return;
        
        // if we change scenes, destroy self
        if (this.scene == null) {
            clearInterval(this.intervalID);
            this.destroy();
            return;
        }

        var player = this.scene.getNearestPlayer(this.x, this.y, viewDistance);
        if (player == null) return;

        this.play('slime_jump');

        // jump towards nearest player
        var dx = player.sprite.x - this.x;
        var dy = player.sprite.y - this.y;
        var angle = Math.atan2(dy, dx);
        // tween jump twards player
        this.scene.tweens.add({
            targets: this,
            x: this.x + Math.cos(angle) * 30,
            y: this.y + Math.sin(angle) * 30,
            duration: 500,
            ease: 'Power2',
            repeat: 0,
            delay: 200,
            onComplete: function() {
                if (this.scene == null) return;
                if (this.stunned) return;

                // if touching player
                if (this.scene.physics.world.overlap(this, player.sprite)) {

                    // should probably make a "stunned" state for the player, but this does the same thing
                    player.attacking = true;
                    player.sprite.play('fall');

                    // knock player back
                    var angle = Math.atan2(player.sprite.y - this.y, player.sprite.x - this.x);
                    this.scene.physics.velocityFromRotation(angle, 100, player.sprite.body.velocity);

                    setTimeout(function() {
                        player.attacking = false;
                        player.sprite.body.setVelocity(0, 0);
                    }, 400);

                }

            },
            onCompleteScope: this
        });

    }

    update() {

    }

}
