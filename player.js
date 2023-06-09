const autoAttackTick = 200;

var index = 0;
var dodgeDistance = 150;
var dodgeDuration = 100;
var xdir = 0;
var ydir = 0;
//Touch Control variables-----
var isDrag = false;
var startDragPos;
//----------------------------
class Player {

    constructor() {
        this.skin = "guy";
        this.dir = "right";
        this.idle = false;
        this.attacking = false;
        this.stunned = false;
        this.speed = 3.5;
        this.items = {};
        this.slots = {};
        this.playerID = index++
        this.exp = 0;
        this.level = 0;
        this.health = 10;
        this.maxHealth = 10;
        this.dashTimer = 1000;
        this.dodging = false;
        this.invincible = false;
        this.meleeDamage = 3; // how much damage to do when melee attacking
        this.projectileDamage = 1; // how much damage to do when projectile attacking
    }

    hasLineOfSight(enemy) {
        var ray = new Phaser.Geom.Line(enemy.x, enemy.y, this.sprite.x, this.sprite.y);
        var tileHits = this.scene.layer_tiles.getTilesWithinShape(ray);
      
        for (var i = 0; i < tileHits.length; i++) {
          var tile = tileHits[i];
          if (tile.collides) {
            return false; // There's a tile with collision in the way
          }
        }
        
        return true; // No tiles with collision found, line of sight is clear
    }

    // called when player enters a new scene
    newScene(scene) {
        this.scene = scene;
        //#region player sounds
        this.inventory_sound = scene.sound.add('inventory_sound');
        this.dash_sound = scene.sound.add('dash_sound');
        //#endregion player sounds

        this.sprite = scene.add.sprite();
        this.sprite.setScale(2.5);
        this.sprite.play(this.skin + '_walk_right');
        this.sprite.id = this.playerID;
        this.sprite.name = "player"
        this.sprite.setDepth(2);
        
        // physics
        scene.physics.add.existing(this.sprite);
        //this.sprite.body.setCollideWorldBounds(true);

        if (this.skin == "girl") {
            this.sprite.body.setOffset(-25,0);
        }

        if (this.skin == "guy") {
            this.sprite.body.setOffset(25,25);
        }

        this.sprite.body.setSize(12, 12);
        this.sprite.setOrigin(0.5, 0.5);

        // player hitbox
        this.hithox = scene.add.rectangle(0, 0, 30, 60);
        scene.physics.world.enable(this.hithox);
        this.hithox.body.setOffset(15, 0);
        this.hithox.id = this.playerID;
        this.hithox.name = "player"

        // melee attack hitbox
        this.Meleehitbox = scene.add.rectangle(-100, -100, 0, 0);
        scene.physics.world.enable(this.Meleehitbox);
        this.Meleehitbox.body.onCollide = true;
        this.Meleehitbox.name = "melee_hitbox";
        this.Meleehitbox.id = this.playerID;
        this.Meleehitbox.body.setSize(150,150);
        
        // hixbox colliders
        scene.physics.add.collider(this.hithox, scene.chests);
        scene.physics.add.collider(this.hithox, scene.items);
        scene.physics.add.collider(this.hithox, scene.enemies);
        scene.physics.add.collider(this.Meleehitbox, scene.enemies);
        scene.physics.add.collider(this.sprite, scene.layer_tiles);
        scene.physics.add.collider(this.sprite, scene.wallLeft);
        scene.physics.add.collider(this.sprite, scene.wallRight);
        scene.physics.add.collider(this.sprite, scene.wallBottom);
        scene.physics.add.collider(this.sprite, scene.projectile_enemy);
        scene.physics.add.collider(this.hithox, scene.boss);
        scene.physics.add.collider(this.Meleehitbox, scene.boss);

        // set position
        if (scene.tp_door?.x && scene.tp_door?.y) {
            this.sprite.x = scene.tp_door.x;
            this.sprite.y = scene.tp_door.y;
        } else {
            this.sprite.x = Phaser.Math.Between(500, 700);
            this.sprite.y = Phaser.Math.Between(300, 500);
        }

        // set direction
        if (levels[this.id]?.from_wall) {
            // face direction of door
            this.dir = levels[this.id].from_wall;
        } else {
            // random direction
            const directions = ["down", "left", "right"];
            this.dir = directions[Math.floor(Math.random() * directions.length)]
        }
        
        this.sprite.play(this.skin + `_idle_${this.dir}`);
        
        // pick up item event
        scene.physics.world.on('collide', (gameObject1, gameObject2) => {
            if (gameObject1 =! this) return;

            if (gameObject2?.texture?.key == "items") {
                scene.items.remove(gameObject2);

                var itemID = gameObject2.frame.name;
                if (this.items[itemID] == undefined) this.items[itemID] = 0;
                this.items[itemID]++;

                // fade item out when picked up
                scene.tweens.add({
                    targets: gameObject2,
                    scaleX: 0,
                    scaleY: 0,
                    alpha: 0,
                    duration: 1000,
                    ease: 'Power2',
                    onComplete: () => {
                        gameObject2.destroy();
                        
                        // remove item from level data
                        levels[scene.id].items = levels[scene.id].items.filter(item => {
                            return !(item.x == gameObject2.x && item.y == gameObject2.y && item.index == itemID);
                        });

                    }
                });
                return;
            }

            // break chest
            if (gameObject2?.texture?.key == "props") {
                gameObject2.setFrame(gameObject2.frame.name - 10);
                scene.chests.remove(gameObject2);

                // 25% chance to drop health potion
                if (Math.random() > 0.75) {
                     // spawn random item
                    var index = levelData.settings.RandItems[Math.floor(Math.random() * levelData.settings.RandItems.length)];
                    var item = scene.physics.add.image(gameObject2.x, gameObject2.y, 'items',  40);
                    item.setOrigin(0.5, 0.5);
                    item.setScale(itemScale);
                    item.setImmovable(true);
                    //item.setDepth(2);
                    item.body.onCollide = true;
                    scene.items.add(item);
                    
                    // cool tween
                    scene.tweens.add({
                        targets: item,
                        scaleX: itemScale * 1.1,
                        scaleY: itemScale * 1.1,
                        duration: 1000,
                        ease: 'Linear',
                        yoyo: true,
                        repeat: -1
                    });
                }

                // spawn random item
                var index = levelData.settings.RandItems[Math.floor(Math.random() * levelData.settings.RandItems.length)];
                var item = scene.physics.add.image(gameObject2.x, gameObject2.y, 'items',  index);
                item.setOrigin(0.5, 0.5);
                item.setScale(itemScale);
                item.setImmovable(true);
                //item.setDepth(2);
                item.body.onCollide = true;
                scene.items.add(item);
                
                // cool tween
                scene.tweens.add({
                    targets: item,
                    scaleX: itemScale * 1.1,
                    scaleY: itemScale * 1.1,
                    duration: 1000,
                    ease: 'Linear',
                    yoyo: true,
                    repeat: -1
                });


            }

            // enemy projectile hit player
            if (gameObject2?.texture?.key == "Mag2" || gameObject2?.texture?.key == "Mag1") {
                gameObject2.destroy();
                if (this.invincible) return;
                players[0].health -= 1;
                this.invincible = true;
                return;
            }
            
        });

        // melee attack end event
        this.sprite.on('animationcomplete', (anim) => {
            if (anim.key.startsWith(this.skin + "_attack_")) {
                this.attacking = false;
            }
        });

        switch(this.playerID) {
            case 0:
                this.controls = { 
                    up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                    down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                    left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                    right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
                    dodge: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
                    pause: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
                    dodge2: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
                }
            break;
            case 1:
                this.controls = { 
                    up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
                    down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
                    left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
                    right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
                    dodge: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DELETE),
                    pause: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
                    dodge2: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CONTROL),
                }
            break;
        }
        this.attackTick = 0;
        this.updateBuffs();
    }

    update(time, delta) {
        let scene = this.scene;

        // auto use health potion
        if (players[0].health < this.maxHealth * 0.75) {
            // drink potion from inventory
            let potionsInv = this.items[40];
            if (potionsInv && potionsInv > 0) {
                inst.gulp.play();
                this.items[40]--;
                players[0].health += this.maxHealth * 0.25;
                if (this.items[40] == 0) delete this.items[40];
            } else if (this.slots[8] == 40) {
                inst.gulp.play();
                delete this.slots[8];
                players[0].health += this.maxHealth * 0.25;
            }
        }

        // respawn if dead
        if (players[0].health <= 0) {
            scene.respawn();
        }

        this.hithox.setPosition(this.sprite.body.position.x, this.sprite.body.position.y);

        // #region inventory

        if (Phaser.Input.Keyboard.JustDown(this.controls.pause)){

            scene.game.renderer.snapshot((image) => {
                this.inventory_sound.play();
                scene.scene.launch('inventory', { screenshot: image, player: this });
                scene.scene.pause();
            });

        }

        // #endregion inventory

        // #region attacks

        // auto attacks
        this.attackTick += delta
        if (this.attackTick > (autoAttackTick * this.buffs.attackSpeed) && scene.enemies != null && scene.enemies.getChildren().length != 0) {
            this.attackTick = 0;

            // get nearest enemy
            let nearestEnemy = scene.enemies.getChildren().reduce((prev, curr) => {
                let prevDist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, prev.x, prev.y);
                let currDist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, curr.x, curr.y);
              
                // Check line of sight for current enemy
                let lineOfSight = this.hasLineOfSight(curr);
              
                if (prevDist < currDist && lineOfSight) {
                  return prev; // Previous enemy is closer and has line of sight
                } else if (currDist < prevDist && lineOfSight) {
                  return curr; // Current enemy is closer and has line of sight
                } else {
                  return prev; // Keep the previous enemy if neither has line of sight
                }
              });

            let enemy_angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, nearestEnemy.x, nearestEnemy.y);
            let enemy_dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, nearestEnemy.x, nearestEnemy.y);

            // melee attack
            if (enemy_dist < 100 && !this.attacking) {
                this.attacking = true;
                this.Meleehitbox.setPosition(this.sprite.x, this.sprite.y);
                var anim = this.skin + "_" + `attack_${this.dir == "left" ? "right" : this.dir}`;
                this.sprite.play(anim);
            }
            
            // projectile attack
            else if (enemy_dist < 500) {
                let mySprite = scene.add.sprite(this.sprite.x, this.sprite.y);
                if (this.skin == "girl") mySprite.play('moveFire');
                else mySprite.play('moveIce');
                mySprite.setScale(3);

                mySprite.name = "projectile";
                // could add other attribues like damage here
                
                scene.physics.add.existing(mySprite);
                scene.projectile_player.add(mySprite);
                mySprite.body.setImmovable(true);
                mySprite.body.onCollide = true;

                let projectileSpeed = 500 * this.buffs.projectileSpeed;
                mySprite.body.setVelocity(Math.cos(enemy_angle) * projectileSpeed, Math.sin(enemy_angle) * projectileSpeed);
                mySprite.angle = Phaser.Math.RadToDeg(enemy_angle);

                // destroy projectile after 1 second
                scene.time.delayedCall(5000, function() {
                    mySprite.destroy();
                });
            }

        }
        

        if (this.attackTick > (autoAttackTick * this.buffs.attackSpeed) && scene.boss != null && scene.boss.getChildren().length != 0) {
            this.attackTick = 0;

            // get nearest enemy
            let nearestEnemy = scene.boss.getChildren().reduce((prev, curr) => {
                let prevDist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, prev.x, prev.y);
                let currDist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, curr.x, curr.y);
                return (prevDist < currDist) ? prev : curr;
            });

            let enemy_angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, nearestEnemy.x+100, nearestEnemy.y+100);
            let enemy_dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, nearestEnemy.x, nearestEnemy.y);

            // melee attack
            if (enemy_dist < 100 && !this.attacking) {
                this.attacking = true;
                this.Meleehitbox.setPosition(this.sprite.x, this.sprite.y);
                var anim = `attack_${this.dir == "left" ? "right" : this.dir}`;
                this.sprite.play(this.skin + "_" + anim);
            }
            
            // projectile attack
            else if (enemy_dist < 500) {
                let mySprite = scene.add.sprite(this.sprite.x, this.sprite.y);
                if (this.skin == "girl") mySprite.play('moveFire');
                else mySprite.play('moveIce');
                mySprite.setScale(3);

                mySprite.name = "projectile";
                // could add other attribues like damage here

                scene.physics.add.existing(mySprite);
                scene.projectile_player.add(mySprite);
                mySprite.body.setImmovable(true);

                let projectileSpeed = 500 * this.buffs.projectileSpeed;
                mySprite.body.setVelocity(Math.cos(enemy_angle) * projectileSpeed, Math.sin(enemy_angle) * projectileSpeed);
                mySprite.angle = Phaser.Math.RadToDeg(enemy_angle);

                // destroy projectile after 1 second
                scene.time.delayedCall(5000, function() {
                    mySprite.destroy();
                });
            }

        }
        
        // #endregion attacks
        if(this.invincible == true && !(this.flash && this.flash.isPlaying())){
            var flashes = 3;
           this.flash =  scene.tweens.add({
                targets: this.sprite,
                alpha: 0,
                duration: 100 * this.buffs.invulnTime,
                repeat: flashes * 2 -1,
                yoyo: true,
                onComplete: () =>{
                    this.sprite.alpha = 1;
                    this.invincible = false;
                },
            });
        }
        // #region dodge
        if(control!=null){
            for (var i = 0; i < control.buttons.length; i++) {
                var button = control.buttons[i];
                if (button.value === 1) {
                    if(button.index == 0 && this.dodging == false){
                        this.dodge(scene);
                    }
                }    
            }    
        }
        if (Phaser.Input.Keyboard.JustDown(this.controls.dodge) && this.dodging == false){
            this.dodge(scene);
        }
        if (Phaser.Input.Keyboard.JustDown(this.controls.dodge2) && this.dodging == false){
            this.dodge(scene);
        }
        
        // #endregion dodge

        // #region movement

        this.idle = true;
        var directions = [];
    
        // keyboard input
        if (this.controls.up.isDown) directions.push("up");
        else if (this.controls.down.isDown) directions.push("down");
        if (this.controls.left.isDown) directions.push("left");
        else if (this.controls.right.isDown) directions.push("right");

        if (directions.length != 0) {
            this.idle = false;

            // calculate angle player is walking
            if (directions.includes("up") && directions.includes("left")) this.angle = 225;
            else if (directions.includes("up") && directions.includes("right")) this.angle = 315;
            else if (directions.includes("down") && directions.includes("left")) this.angle = 135;
            else if (directions.includes("down") && directions.includes("right")) this.angle = 45;
            else if (directions.includes("up")) this.angle = 270;
            else if (directions.includes("down")) this.angle = 90;
            else if (directions.includes("left")) this.angle = 180;
            else if (directions.includes("right")) this.angle = 0;
        }

        
        // joystick input
        if (window.joyStick && window.joyStick.angle != 0) {
            this.angle = window.joyStick.angle;
            if (this.angle < 0) this.angle += 360;
            console.log(this.angle, 'angle');
            this.idle = false;
        }
        
        //gamepad movement
       if(control != null && control.axes.length > 0){
            //console.log("in player scene.");
            
            var X = control.axes[0].getValue(); //gets value between -1 and 1
            var Y = control.axes[1].getValue(); //gets value between -1 and 1
            var angle = Math.atan2(Y, X);  //gets angle in radians
            if(angle < 0){
                angle += 2 * Math.PI; //converts to a number between 0 and 2PI
            }
            this.angle = angle * 180 / Math.PI; //converts to degrees
            this.idle = false; //character is moving
            var X = control.axes[0].getValue(); //gets value between -1 and 1
            var Y = control.axes[1].getValue(); //gets value between -1 and 1
            if(X == 0 && Y == 0){ //if the player let go of the stick then the character is idle
                this.idle = true;
            }
       }

        // if moving this frame
        if (!this.idle) {
            this.sprite.body.setVelocityX((this.speed * this.buffs.speedBoost) * Math.cos(Phaser.Math.DegToRad(this.angle)) * 100);
            this.sprite.body.setVelocityY((this.speed * this.buffs.speedBoost) * Math.sin(Phaser.Math.DegToRad(this.angle)) * 100);

            
             // set this.dir based on angle
             if (this.angle >= 315 || this.angle <= 45) this.dir = "right";
             else if (this.angle >= 135 && this.angle <= 225) this.dir = "left";
             else if (this.angle > 45 && this.angle <= 135) this.dir = "down";
             else this.dir = "up";
        } else {
            if (!this.stunned) {
                this.sprite.body.setVelocity(0, 0);
            }
        }

        //#endregion movement

        // #region animation
        // set player animation
        // replaces "left" dir with "right" animation because it's just mirred right
        if (this.dir == "left") this.sprite.flipX = true;
        if (this.dir == "right") this.sprite.flipX = false;

        if (!this.attacking) {
            var anim = this.skin + "_" + `${this.idle ? "idle" : "walk"}_${this.dir == "left" ? "right" : this.dir}`;
            if (this.sprite.anims.currentAnim.key != anim) this.sprite.play(anim);

            this.Meleehitbox.x = -100;
            this.Meleehitbox.y = -100;
        }
        //#endregion animation

    }

    updateBuffs() {

        // buff multipliers
        this.buffs = {
            invulnTime: 1,          // ☑
            dodgeCharge: 1,         // TODO implement
            projectileCount: 1,     // TODO implement
            damageBoost: 1,         // ☑
            dashCooldown: 1,        // ☑
            projectileSpeed: 1,     // ☑
            speedBoost: 1,          // ☑
            attackSpeed: 1,         // ☑
            meleeDamage: 1,         // ☑
            projectileDamage: 1,    // implimented but no items give this buff
            healthBoost: 0          // ☑
        };

        // for each item in a slot, add stats
        for (var slotID in players[0].slots) {
            var itemID = players[0].slots[slotID];
            let data = getItemData(itemID);
            Object.keys(players[0].buffs).forEach(buf => {
                if (data[buf] != undefined)
                    players[0].buffs[buf] += data[buf]
            });
        }
        
        let oldHealth = players[0].maxHealth;
        players[0].maxHealth = 10 + players[0].buffs.healthBoost;

        // if maxHealth changed, update actual health
        if (oldHealth != players[0] .maxHealth) {
            players[0].health = players[0].maxHealth;
        }
    }

    dodge(scene) {
        this.dodging = true;
        this.invincible = true;
        this.dash_sound.play();
        // setTimeout(() => {
        //     this.dodging = false; 
        // }, this.dashTimer * players[0].buffs.dashCooldown);
        //console.log(this.angle);
        xdir = this.sprite.x + Math.cos(Phaser.Math.DegToRad(this.angle)) * dodgeDistance;
        ydir = this.sprite.y + Math.sin(Phaser.Math.DegToRad(this.angle)) * dodgeDistance;
        
        let dist = dodgeDistance;
        while(dist > 0){
            xdir = this.sprite.x + Math.cos(Phaser.Math.DegToRad(this.angle)) * dist;
            ydir = this.sprite.y + Math.sin(Phaser.Math.DegToRad(this.angle)) * dist;
            
            var isSolid = scene.solidAt(xdir, ydir, true);
            if(!isSolid){
                break;
            }
            else{
                dist-= 20;
            }
        }
        if(dist == 0 || scene.solidAt(xdir, ydir, true)){
            xdir = this.sprite.x;
            ydir = this.sprite.y;
        }

        this.sprite.inputEnabled = false;
        scene.tweens.add({
            targets: this.sprite,
            x: xdir, // Move the sprite 100 pixels to the right
            y: ydir,
            duration: dodgeDuration, // Half the duration for the first part of the dodge
            repeat: 0, // Repeat the tween once to complete the dodge motion
        });
        for(let i = 0; i <= 5; i ++){
            let clone = scene.add.sprite();
            clone.setScale(2.5);
            clone.id = this.sprite.id;
            clone.setPosition(this.sprite.x, this.sprite.y);
            clone.dir = this.sprite.dir;
            let animation_key = this.sprite.anims.currentAnim.key;
            clone.play(animation_key);
            if (this.dir == "left") clone.flipX = true;
            if (this.dir == "right") clone.flipX = false;
            clone.anims.stop();
            clone.alpha = 1;

            scene.tweens.add({
                targets: clone,
                x: xdir, // Move the sprite 100 pixels to the right
                y: ydir,
                alpha: clone.alpha - 0.2 * i,
                duration: dodgeDuration + 50 * i, // Half the duration for the first part of the dodge
                repeat: 0, // Repeat the tween once to complete the dodge motion
                onComplete: () => {
                    this.sprite.inputEnabled = true;
                    clone.destroy();
                },
            });
        }
    }

    //TOUCH CONTROL FUNCTIONS
    startDrag(pointer){
        isDrag = true;
        startDragPos = {
            x: pointer.x,
            y: pointer.y
        };
    }
    drag(pointer){
        if(isDrag){
            var deltaX = pointer.x - startDragPos.x;
            var deltaY = pointer.y - startDragPos.y;
        }
    }
    stopDrag(){
        isDrag = false;
    }
    

}