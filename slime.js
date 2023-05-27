const viewDistance = 500;
const health = 3;

class Slime extends Enemy {

    constructor(scene, x, y) {
        super(scene, 'slime', x, y);
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

}