const viewDistance = 500;
const health = 500;

class Slime extends Enemy {

    constructor(scene, x, y) {
        super(scene, 'slime', x, y);
        this.scene = scene;
        
        var randTick = Phaser.Math.Between(1500, 2000);
        this.intervalID = setInterval(this.jump.bind(this), randTick);
    }

    jump() {
        if (this.stunned) return;
        
        if (this.scene == null) {
            clearInterval(this.intervalID);
            return;
        }

        var player = this.scene.getNearestPlayer(this.x, this.y, viewDistance);
        if (player == null) return;

        this.play('slime_jump');

        // jump towards nearest player
        var angle = Math.atan2( player.sprite.y - this.y, player.sprite.x - this.x);
        this.scene.tweens.add({
            targets: this,
            x: this.x + Math.cos(angle) * 30,
            y: this.y + Math.sin(angle) * 30,
            duration: 500,
            ease: 'Power2',
            repeat: 0,
            delay: 200
        });

    }

}