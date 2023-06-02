// Inventory and Settings scenes

function getItemData(itemID) {
    var data;

    switch(parseInt(itemID)) {
        case 0: { data = { description: "Abner's Banana: \nDamage Invulnerability: +5 seconds", invulnTime: 0.05 }; break; }
        case 1: { data = { description: "Mark's Coffee: \nDodge Charge +1", dodgeCharge: 0.01 }; break; }
        case 2: { data = { description: "Nico's Brush:\n +1 Projectile", projectileCount: 0.01 }; break; }
        case 3: { data = { description: "Oliver's Oil:\n +5% Damage", damageBoost: 0.05 }; break; }

        case 4: { data = { description: "Turquoise crystal: \n-6% Dash cooldown", dashCooldown: -0.06 }; break; }
        case 5: { data = { description: "Green crystal: \n-5% Dash cooldown", dashCooldown: -0.05 }; break; }
        case 6: { data = { description: "Pink crystal: \n-4% Dash cooldown", dashCooldown: -0.04 }; break; }
        case 7: { data = { description: "Purple crystal: -3% Dash cooldown", dashCooldown: -0.03 }; break; }
        case 8: { data = { description: "Red crystal: -2% Dash cooldown", dashCooldown: -0.02 }; break; }
        case 9: { data = { description: "Yellow crystal: -1% Dash cooldown", dashCooldown: -0.01 }; break; }

        case 10: { data = { description: "Adamantite gem: \n+6% Projectile Speed", projectileSpeed: 0.06 }; break; }
        case 11: { data = { description: "Platinum gem: \n+5% Projectile Speed", projectileSpeed: 0.05 }; break; }
        case 12: { data = { description: "Gold gem: \n+4% Projectile Speed", projectileSpeed: 0.04 }; break; }
        case 13: { data = { description: "Silver gem: +3% Projectile Speed", projectileSpeed: 0.03 }; break; }
        case 14: { data = { description: "Brass gem: +2% Projectile Speed", projectileSpeed: 0.02 }; break; }
        case 15: { data = { description: "Iron gem: +1% Projectile Speed", projectileSpeed: 0.01 }; break; }

        case 16: { data = { description: "Adamantite anklet: \n+6% Movement Speed", speedBoost: 0.06 }; break; }
        case 17: { data = { description: "Platinum anklet: \n+5% Movement Speed", speedBoost: 0.05  }; break; }
        case 18: { data = { description: "Gold anklet: \n+4% Movement Speed", speedBoost: 0.04 }; break; }
        case 19: { data = { description: "Silver anklet: \n+3% Movement Speed", speedBoost: 0.03 }; break; }
        case 20: { data = { description: "Brass anklet: +2% Movement Speed", speedBoost: 0.02 }; break; }
        case 21: { data = { description: "Iron anklet: +1% Movement Speed", speedBoost: 0.01 }; break; }

        case 22: { data = { description: "Adamantite ring: \n+6% Attack Speed", attackSpeed: 0.06 }; break; }
        case 23: { data = { description: "Platinum ring: \n+5% Attack Speed", attackSpeed: 0.05 }; break; }
        case 24: { data = { description: "Gold ring:\n +4% Attack Speed", attackSpeed: 0.04 }; break; }
        case 25: { data = { description: "Silver ring:\n +3% Attack Speed", attackSpeed: 0.03 }; break; }
        case 26: { data = { description: "Brass ring: +2% Attack Speed", attackSpeed: 0.02 }; break; }
        case 27: { data = { description: "Iron ring: +1% Attack Speed", attackSpeed: 0.01 }; break; }

        case 28: { data = { description: "Adamantite bracelet: \n+6% Melee Damage", meleeDamage: 0.06 }; break; }
        case 29: { data = { description: "Platinum bracelet: \n+5% Melee Damage", meleeDamage: 0.05 }; break; }
        case 30: { data = { description: "Gold bracelet: \n+4% Melee Damage", meleeDamage: 0.04 }; break; }
        case 31: { data = { description: "Silver bracelet: \n+3% Melee Damage", meleeDamage: 0.03 }; break; }
        case 32: { data = { description: "Brass bracelet: +2% Melee Damage", meleeDamage: 0.02 }; break; }
        case 33: { data = { description: "Iron bracelet: +1% Melee Damage", meleeDamage: 0.01 }; break; }

        case 34: { data = { description: "Adamantite amulet: \n+20 Health", healthBoost: 0.020 }; break; }
        case 35: { data = { description: "Platinum amulet: \n+15 Health", healthBoost: 0.015 }; break; }
        case 36: { data = { description: "Gold amulet: +10 Health", healthBoost: 0.010 }; break; }
        case 37: { data = { description: "Silver amulet: +5 Health", healthBoost: 0.05 }; break; }
        case 38: { data = { description: "Brass amulet: +3 Health", healthBoost: 0.03 }; break; }
        case 39: { data = { description: "Iron amulet: +1 Health", healthBoost: 0.01 }; break; }

        // if we see this message in game, we forgot to add an item description
        default: { data = { description: itemID }; break; }
    }
    
    return data;
}

class Inventory extends Phaser.Scene {
    constructor() {
        super('inventory')
    }

    init(data) {
        this.player = data.player;
        this.data = data;

        // destroy previous background image
        const bgTexture = this.textures.get("bg");
        if (bgTexture) bgTexture.destroy();

        // load new background image
        this.textures.addBase64("bg", data.screenshot.src);
    }

    // show a white square around the item and description
    enableHighlight(itemSprite) {
        this.disableHighlight();

        this.highlightSquare = this.add.graphics();
        this.highlightSquare.lineStyle(3, 0xffffff);
        var width = itemSprite.displayWidth;
        var height = itemSprite.displayHeight;
        var x = itemSprite.x - width / 2;
        var y = itemSprite.y - height / 2;
        this.highlightSquare.strokeRect(x, y, width, height);

        // set empty slot description
        if (itemSprite.frame.name == 40) {
            let slotType = itemSprite.slotType;
            let slotDescription = this.getEmptySlotDescription(slotType);
            this.description.text = slotDescription;
            return;
        }

        // set item description
        let itemID = itemSprite.frame.name;
        let data = getItemData(itemID);
        this.description.text = data.description;
    }

    disableHighlight() {
        if (this.highlightSquare != null)
            this.highlightSquare.clear();

        this.description.text = "";
    }

    addItemSlot(x,y,slotType) {
        let slotID = this.slotID++;
        let itemInSlot = players[0].slots[slotID];
        if (itemInSlot == undefined) itemInSlot = 40;

        let itemSlot = this.add.image(0, 0, 'items',  itemInSlot);
        itemSlot.setOrigin(0.25, 0.25);
        itemSlot.setPosition(this.inv.x - this.invScale * x, this.inv.y - this.invScale * y);
        itemSlot.setScale(this.invScale * 1.2);
        itemSlot.slotID = slotID;
        itemSlot.slotType = slotType;
        this.addEvents(itemSlot, 0);
    }

    getItemType(itemID) {
        if (itemID >= 0 && itemID <= 3) return "unique";
        if (itemID >= 4 && itemID <= 9) return "crystal";
        if (itemID >= 10 && itemID <= 15) return "gem";
        if (itemID >= 16 && itemID <= 21) return "anklet";
        if (itemID >= 22 && itemID <= 27) return "ring";
        if (itemID >= 28 && itemID <= 33) return "bracelet";
        if (itemID >= 34 && itemID <= 39) return "amulet";
    }

    getEmptySlotDescription(slotType) {
        switch(slotType) {
            case "crystal": return "Crystal slot";
            case "gem": return "Gem slot";
            case "anklet": return "Anklet slot";
            case "ring": return "Ring slot";
            case "bracelet": return "Bracelet slot";
            case "amulet": return "Amulet slot";
            case "trash": return "Trash (destroy item)";
            case "item": return "Use item slot";
        }
    }

    addEvents(itemSprite, itemCount) {
        itemSprite.homeX = itemSprite.x;
        itemSprite.homeY = itemSprite.y;
        itemSprite.setInteractive();

        let itemScale = itemSprite._scaleX;

        itemSprite.on('pointerover', () => {
            if (this.holding != undefined) return;
            this.enableHighlight(itemSprite);
        });

        itemSprite.on('pointerout', () => {
            this.disableHighlight();
        });

        itemSprite.on('pointerdown', () => {
            // if item is empty, return
            if (itemSprite.frame.name == 40) return;

            this.disableHighlight();

            this.itemSpriteClone = this.add.image(0, 0, 'items',  itemSprite.frame.name);
            this.itemSpriteClone.x = itemSprite.x;
            this.itemSpriteClone.y = itemSprite.y;
            this.itemSpriteClone.setScale(itemScale);

            //sprite that it dragged around with mouse
            this.holding = this.itemSpriteClone;
            
            // sprite that is in the original slot
            this.holdingSprite = itemSprite;

            // number of items in the original slot
            this.holdingCount = itemCount;

            if (itemCount <= 1) {
                itemSprite.visible = false;
            }

        });

        this.input.on('pointerup', (pointer) => {
            if (this.holding == undefined) return;

            // if dropped over another item slot
            for (let i = 0; i < this.allItems.length; i++) {
                const itemSprite = this.allItems[i];
                let itemID = this.holding.frame.name;

                if (itemSprite.getBounds().contains(this.input.x, this.input.y)) {

                    let toSlotID = itemSprite.slotID;            // slot ID being dropped over
                    let toSlotType = itemSprite.slotType;        // slot type being dropped over
                    let toSlotItem = players[0].slots[toSlotID]; // item ID in slot being dropped over
                    let fromInv = this.holdingCount != 0;        // true if item is being dragged from inventory
                    let fromSlotID = this.holdingSprite.slotID;  // slot ID being dragged from
                    let fromItemType = this.getItemType(itemID); // item type being dragged

                    // if dropped over the same slot, return
                    if (toSlotID != undefined && toSlotID == fromSlotID) break;

                    // if dropped over trash slot, delete
                    if (toSlotType == "trash") {
                        if (fromInv) {
                            players[0].items[itemID]--;
                            if (players[0].items[itemID] <= 0) {
                                delete players[0].items[itemID];
                            }
                        } else {
                            delete players[0].slots[fromSlotID];
                        }
                        break;
                    }


                    // if dropped over empty slot, delete from previous slot
                    if (!fromInv && toSlotItem == undefined) {

                        // if slot matches item type
                        if (fromItemType == toSlotType || toSlotType == undefined) {
                            delete players[0].slots[fromSlotID];
                        }

                    }

                    // if dropped from slot to inventory, add to inventory
                    if (!fromInv && toSlotID == undefined) {

                        // add to inventory
                        if (players[0].items[itemID] == undefined) {
                            players[0].items[itemID] = 0;
                        }
                        players[0].items[itemID]++;

                        break;
                    }

                    // move item to slot, if empty and matches type
                    if (toSlotItem == undefined && fromItemType == toSlotType) {
                        itemSprite.setFrame(itemID);

                        // moved to slot (left)
                        if (toSlotID != undefined) {

                            // moved to slot from inventory
                            if (fromInv) {

                                // remove item from inventory
                                players[0].items[itemID]--;
                                if (players[0].items[itemID] <= 0) {
                                    delete players[0].items[itemID];
                                }

                                
                            }

                            players[0].slots[toSlotID] = itemID;

                        }

                        if (this.holdingCount <= 1) {
                            this.holdingSprite.setFrame(40);
                            this.holdingSprite.visible = true;
                        } 

                    }

                    break;
                }

            }

            if (this.holdingSprite != undefined) {
                this.holdingSprite.visible = true;
                this.holdingSprite = undefined;
            }

            this.holding.destroy();
            this.holding = undefined;

            // destroy clone
            if (this.itemSpriteClone != undefined) {
                this.itemSpriteClone.destroy();
                this.itemSpriteClone = undefined;
            }

            this.reloadInv();
        });

        this.allItems.push(itemSprite);
    }

    reloadInv() {

        // destroy previous inventory
        this.allItems.forEach(item => item.destroy());
        this.allItemTexts.forEach(text => text.destroy());

        // item slots that display at the left
        this.slotID = 0;
        this.addItemSlot(72, 54, "amulet");
        this.addItemSlot(45.5, 25, "ring");
        this.addItemSlot(72, 26, "bracelet");
        this.addItemSlot(96.5, 25, "ring");
        this.addItemSlot(46.5, 2.5, "anklet");
        this.addItemSlot(70.5, 1.5, "gem");
        this.addItemSlot(96.5, 2.5, "anklet");
        this.addItemSlot(31, -76, "trash");
        this.addItemSlot(114, -76, "item");

        let items = this.player.items;

        let itemsPerRow = 4;
        let itemsCount = 0;
        if (items != undefined)itemsCount = 0;
        if(items != undefined) itemsCount = Object.keys(items).length;
        if (itemsCount > 4 * 6) itemsPerRow = 5;
        if (itemsCount > 5 * 8) itemsPerRow = 6;
        if (itemsCount > 6 * 9) itemsPerRow = 7;
        if (itemsCount > 7 * 10) itemsPerRow = 8;
        if (itemsCount > 8 * 12) itemsPerRow = 9;
        // more than 126 unique items will clip off the inventory

        let padding = this.invScale * 17 * (5 / itemsPerRow);
        let itemScale = this.invScale * 0.8 * (5 / itemsPerRow);

        let i = 0;
        for (var item in items) {
            let itemCount = items[item];

            let itemSprite = this.add.image(0, 0, 'items',  item);
            itemSprite.setOrigin(0.25, 0.25);
            itemSprite.setScale(itemScale);
            itemSprite.x = this.inv.x + (i % itemsPerRow) * padding + (38 * this.invScale);
            itemSprite.y = this.inv.y + Math.floor(i / itemsPerRow) * padding - (46 * this.invScale);
            

            // add text with item count
            if (itemCount > 1) {
                let text = this.add.text(itemSprite.x + (itemSprite.width * itemScale) / 2, itemSprite.y + (itemSprite.height * itemScale) / 2, itemCount, 
                { fontFamily: 'Arial', fontSize: 20, color: '#000000', fontWeight: 'bold' });
                text.setOrigin(0.5);
                text.setDepth(1.1);
                this.allItemTexts.push(text);
            }

            this.addEvents(itemSprite, itemCount);
            i++;
        }

        players[0].updateBuffs();
    }

    create() {
        this.allItems = [];
        this.allItemTexts = [];
        this.resumeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        // wait for base64 background image to be loaded
        this.textures.once('addtexture', () => {

            this.add.image(0, 0, "bg").setOrigin(0);

            // add gray overlay
            let overlay = this.add.graphics();
            overlay.fillStyle(0x000000, 0.5);
            overlay.fillRect(0, 0, this.game.config.width, this.game.config.height);

            this.inv = this.add.image(0, 0, 'inventory');
            this.inv.setPosition(this.scale.width / 2, this.scale.height / 2);
            this.invScale = Math.min(this.scale.width / this.inv.width, this.scale.height / this.inv.height) * 0.8;
            this.inv.setScale(this.invScale);
            this.inv.setOrigin(0.5);
            this.inv.setPosition(this.scale.width / 2, this.scale.height / 2);

            // text
            let health = players[0].health;
            let exp = players[0].exp;
            let level = players[0].level;
            this.add.text(this.inv.x - this.invScale * 109, this.inv.y - this.invScale * 80, health, { fontFamily: 'Arial', fontSize: this.invScale * 6, color: '#000000', fontWeight: 'bold' });
            this.add.text(this.inv.x - this.invScale * 109, this.inv.y - this.invScale * 72, exp, { fontFamily: 'Arial', fontSize: this.invScale * 6, color: '#000000', fontWeight: 'bold' });
            this.add.text(this.inv.x - this.invScale * 109, this.inv.y - this.invScale * 63, level, { fontFamily: 'Arial', fontSize: this.invScale * 6, color: '#000000', fontWeight: 'bold' });

            // description text
            this.description = this.add.text(this.inv.x - this.invScale * 112, this.inv.y - this.invScale * -20, "", { fontFamily: 'Arial', fontSize: this.invScale * 6, color: '#000000', fontWeight: 'bold' });

            // escape button
            let resumeButton = this.add.image(0, 0, 'inventory_esc');
            resumeButton.setScale(this.invScale);
            resumeButton.setPosition(this.inv.x + this.invScale * -40, this.inv.y - this.invScale * 87);
            resumeButton.setInteractive();
            resumeButton.setOrigin(0, 0);
            resumeButton.on('pointerover', () => resumeButton.setTexture('inventory_escpull'));
            resumeButton.on('pointerout', () => resumeButton.setTexture('inventory_esc'));
            resumeButton.on('pointerdown', () => {
                this.scene.resume('gamelevel').launch('ui');
                this.scene.stop('inventory');
            });

            // menu button
            let menuButton = this.add.image(0, 0, 'inventory_menu');
            menuButton.setScale(this.invScale);
            menuButton.setPosition(this.inv.x + this.invScale * -70, this.inv.y - this.invScale * 87);
            menuButton.setInteractive();
            menuButton.setOrigin(0, 0);
            menuButton.on('pointerover', () => menuButton.setTexture('inventory_menupull'));
            menuButton.on('pointerout', () => menuButton.setTexture('inventory_menu'));
            menuButton.on('pointerdown', () => {
                this.scene.start('settings', { screenshot: this.data.screenshot, player: this.data.player });
            });

            this.reloadInv();

        });
        
    }

    update() {

        if (this.holding != undefined) {
            this.holding.x = this.input.x;
            this.holding.y = this.input.y;

            // for each this.allItems
            for (let i = 0; i < this.allItems.length; i++) {
                const itemSprite = this.allItems[i];
                if (itemSprite == this.holding) continue;

                if (itemSprite.getBounds().contains(this.input.x, this.input.y)) {
                    this.enableHighlight(itemSprite);
                    break;
                } else {
                    this.disableHighlight(itemSprite);
                }

            };
            

        }

        if (Phaser.Input.Keyboard.JustDown(this.resumeKey)) {
            this.scene.resume('gamelevel').launch('ui');
            this.scene.stop('inventory');
        }

    }

}

class Settings extends Phaser.Scene {
    constructor() {
        super('settings')
    }

    init(data) {
        this.data = data;
        // destroy previous background image
        const bgTexture = this.textures.get("bg");
        if (bgTexture) bgTexture.destroy();

        // load new background image
        this.textures.addBase64("bg", data.screenshot.src);
    }

    create() {
        this.resumeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        // wait for base64 background image to be loaded
        this.textures.once('addtexture', () => {

            this.add.image(0, 0, "bg").setOrigin(0);

            // add gray overlay
            let overlay = this.add.graphics();
            overlay.fillStyle(0x000000, 0.5);
            overlay.fillRect(0, 0, this.game.config.width, this.game.config.height);

            this.inv = this.add.image(0, 0, 'inventory_empty');
            this.inv.setPosition(this.scale.width / 2, this.scale.height / 2);
            this.invScale = Math.min(this.scale.width / this.inv.width, this.scale.height / this.inv.height) * 0.8;
            this.inv.setScale(this.invScale);
            this.inv.setOrigin(0.5);
            this.inv.setPosition(this.scale.width / 2, this.scale.height / 2);
            
            // text
            let musicText = this.add.text(this.inv.x - this.invScale * 119, this.inv.y - this.invScale * 45, "Music: off", { fontFamily: 'Arial', fontSize: this.invScale * 14, color: '#000000' });
            if (playMusic) musicText.text = "Music: on";
            musicText.setInteractive();
            musicText.on('pointerover', () => musicText.setColor('#626770'));
            musicText.on('pointerout', () => musicText.setColor('#000000'));
            musicText.on('pointerdown', () => {
                if (playMusic) {
                    musicText.text = "Music: off";
                    playMusic = false;
                } else {
                    musicText.text = "Music: on";
                    playMusic = true;
                }
            });

            let soundText = this.add.text(this.inv.x - this.invScale * 119, this.inv.y - this.invScale * 25, "Other sounds: off", { fontFamily: 'Arial', fontSize: this.invScale * 14, color: '#000000' });
            if (!this.sound.mute) soundText.text = "Other sounds: on";
            soundText.setInteractive();
            soundText.on('pointerover', () => soundText.setColor('#626770'));
            soundText.on('pointerout', () => soundText.setColor('#000000'));
            soundText.on('pointerdown', () => {
                if (!this.sound.mute) {
                    soundText.text = "Other sounds: off";
                    this.sound.mute = true;
                } else {
                    soundText.text = "Other sounds: on";
                    this.sound.mute = false;
                }
            });

            let fullScreenText = this.add.text(this.inv.x - this.invScale * 119, this.inv.y - this.invScale * 5, "Fullscreen: off", { fontFamily: 'Arial', fontSize: this.invScale * 14, color: '#000000' });
            if (this.scale.isFullscreen) fullScreenText.text = "Fullscreen: off";
            fullScreenText.setInteractive();
            fullScreenText.on('pointerover', () => fullScreenText.setColor('#626770'));
            fullScreenText.on('pointerout', () => fullScreenText.setColor('#000000'));
            fullScreenText.on('pointerdown', () => {
                if (this.scale.isFullscreen) {
                    this.scale.stopFullscreen();
                    fullScreenText.text = "Fullscreen: off";
                } else {
                    this.scale.startFullscreen();
                    fullScreenText.text = "Fullscreen: on";
                }
            });
            

            // escape button
            let resumeButton = this.add.image(0, 0, 'inventory_esc');
            resumeButton.setScale(this.invScale);
            resumeButton.setPosition(this.inv.x + this.invScale * -40, this.inv.y - this.invScale * 87);
            resumeButton.setInteractive();
            resumeButton.setOrigin(0, 0);
            resumeButton.on('pointerover', () => resumeButton.setTexture('inventory_escpull'));
            resumeButton.on('pointerout', () => resumeButton.setTexture('inventory_esc'));
            resumeButton.on('pointerdown', () => {
                this.scene.resume('gamelevel').launch('ui');
                this.scene.stop('settings');
            });

            // inventory button
            let invButton = this.add.image(0, 0, 'inventory_inv');
            invButton.setScale(this.invScale);
            invButton.setPosition(this.inv.x + this.invScale * -60, this.inv.y - this.invScale * 87);
            invButton.setInteractive();
            invButton.setOrigin(0, 0);
            invButton.on('pointerover', () => invButton.setTexture('inventory_invpull'));
            invButton.on('pointerout', () => invButton.setTexture('inventory_inv'));
            invButton.on('pointerdown', () => {
                this.scene.start('inventory', { screenshot: this.data.screenshot, player: this.data.player });
            });

        });
        
    }

    update() {

        if (Phaser.Input.Keyboard.JustDown(this.resumeKey)) {
            this.scene.resume('gamelevel').launch('ui');
            this.scene.stop('settings');
        }

    }

}