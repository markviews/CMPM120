
const viewDistance = 500;

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

        // idle after jump
        this.on('animationcomplete', function (anim, frame) {
            if (anim.key == 'slime_jump')
                this.play('slime_idle');
        });

        // each slime gets a random tick rate between 1.5 and 2 seconds
        this.intervalID = setInterval(this.jump.bind(this), Phaser.Math.Between(1500, 2000));
    }

    jump() {
        
        // if we change scenes, destroy self
        if (this.scene == null) {
            clearInterval(this.intervalID);
            this.destroy();
            return;
        }

        var p = this.scene.getNearestPlayer(this.x, this.y, viewDistance);
        if (p == null) return;

        this.play('slime_jump');

        // jump towards nearest player
        var dx = p.player.x - this.x;
        var dy = p.player.y - this.y;
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
                    
                // if touching player
                if (this.scene.physics.world.overlap(this, p.player)) {

                    // knock player back
                    var dx = p.player.x - this.x;
                    var dy = p.player.y - this.y;
                    var angle = Math.atan2(dy, dx);

                    // should probably make a "stunned" state for the player, but this does the same thing
                    p.attacking = true;

                    p.player.play('fall');

                    this.scene.tweens.add({
                        targets: p.player,
                        x: p.player.x + Math.cos(angle) * 30,
                        y: p.player.y + Math.sin(angle) * 30,
                        ease: 'Power1',
                        duration: 500,
                        onComplete: function() {
                            p.attacking = false;
                        },
                        onCompleteScope: this
                    });

                }

            },
            onCompleteScope: this
        });

    }

    update() {

    }

}
