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

            if (this.stunned) return;

            var player = this.scene.getNearestPlayer(this.x, this.y, viewDistance);
            if (player == null) return;
            if (!player.hasLineOfSight(this))  return;

            // jump towards nearest player
            var angle = Math.atan2( player.sprite.y - this.y, player.sprite.x - this.x);
            this.scene.physics.moveTo(this, this.x + Math.cos(angle) * 30, this.y + Math.sin(angle) * 30, 30);
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