// Inventory and Settings scenes

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

    enableHighlight(itemSprite) {
        this.disableHighlight();

        this.highlightSquare = this.add.graphics();
        this.highlightSquare.lineStyle(3, 0xffffff);
        var squareWidth = itemSprite.displayWidth + 15;
        var squareHeight = itemSprite.displayHeight + 15;
        this.highlightSquare.strokeRect(itemSprite.x - squareWidth / 2, itemSprite.y - squareHeight / 2, squareWidth, squareHeight);
    }

    disableHighlight() {
        if (this.highlightSquare != null)
            this.highlightSquare.clear();
    }

    addItemSlot(x,y) {
        let slotID = this.slotID++;
        let itemInSlot = players[0].slots[slotID];
        if (itemInSlot == undefined) itemInSlot = 6;

        let itemSlot = this.add.image(0, 0, 'items',  itemInSlot);
        itemSlot.setPosition(this.inv.x - this.invScale * x, this.inv.y - this.invScale * y);
        itemSlot.setScale(this.invScale * 0.7);
        itemSlot.slotID = slotID;
        this.addEvents(itemSlot, 0);
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
            if (itemSprite.frame.name == 6) return;

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
                    let toSlotItem = players[0].slots[toSlotID]; // item ID in slot being dropped over
                    let fromInv = this.holdingCount != 0;        // true if item is being dragged from inventory
                    let fromSlotID = this.holdingSprite.slotID;  // slot ID being dragged from

                    // if dropped over the same slot, return
                    if (toSlotID != undefined && toSlotID == fromSlotID) break;

                    // if dropped over empty slot, delete from previous slot
                    if (!fromInv && toSlotItem == undefined) {
                        delete players[0].slots[fromSlotID];
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

                    // move item to slot, if empty
                    if (toSlotItem == undefined) {
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
                            this.holdingSprite.setFrame(6);
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
        this.addItemSlot(71, 51);
        this.addItemSlot(45.5, 25);
        this.addItemSlot(71.5, 25);
        this.addItemSlot(96.5, 25);
        this.addItemSlot(46.5, 2.5);
        this.addItemSlot(71.5, 2.5);
        this.addItemSlot(96.5, 2.5);
        this.addItemSlot(31, -76);
        this.addItemSlot(114, -76);

        let items = this.player.items;

        let itemsPerRow = 4;
        let itemsCount = Object.keys(items).length;
        if (itemsCount > 4 * 6) itemsPerRow = 5;
        if (itemsCount > 5 * 8) itemsPerRow = 6;
        if (itemsCount > 6 * 9) itemsPerRow = 7;
        if (itemsCount > 7 * 10) itemsPerRow = 8;
        if (itemsCount > 8 * 12) itemsPerRow = 9;
        // more than 126 unique items will clip off the inventory

        let padding = this.invScale * 17 * (5 / itemsPerRow);
        let itemScale = this.invScale * 0.7 * (5 / itemsPerRow);

        let i = 0;
        for (var item in items) {
            let itemCount = items[item];

            let itemSprite = this.add.image(0, 0, 'items',  item);
            itemSprite.x = this.inv.x + (i % itemsPerRow) * padding + (38 * this.invScale);
            itemSprite.y = this.inv.y + Math.floor(i / itemsPerRow) * padding - (46 * this.invScale);
            itemSprite.setScale(itemScale);

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
            this.add.text(this.inv.x - this.invScale * 109, this.inv.y - this.invScale * 80, "50", { fontFamily: 'Arial', fontSize: this.invScale * 6, color: '#000000', fontWeight: 'bold' });
            this.add.text(this.inv.x - this.invScale * 109, this.inv.y - this.invScale * 72, "50", { fontFamily: 'Arial', fontSize: this.invScale * 6, color: '#000000', fontWeight: 'bold' });
            this.add.text(this.inv.x - this.invScale * 109, this.inv.y - this.invScale * 63, "50", { fontFamily: 'Arial', fontSize: this.invScale * 6, color: '#000000', fontWeight: 'bold' });

            // escape button
            let resumeButton = this.add.image(0, 0, 'inventory_esc');
            resumeButton.setScale(this.invScale);
            resumeButton.setPosition(this.inv.x + this.invScale * -40, this.inv.y - this.invScale * 87);
            resumeButton.setInteractive();
            resumeButton.setOrigin(0, 0);
            resumeButton.on('pointerover', () => resumeButton.setTexture('inventory_escpull'));
            resumeButton.on('pointerout', () => resumeButton.setTexture('inventory_esc'));
            resumeButton.on('pointerdown', () => {
                this.scene.resume('gamelevel');
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
            this.scene.resume('gamelevel');
            this.scene.stop('inventory');
        }

    }

}

class Settings extends Phaser.Scene {
    constructor() {
        super('settings')
    }

    init(data) {
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
                this.scene.resume('gamelevel');
                this.scene.stop('settings');
            });

        });
        
    }

    update() {

        if (Phaser.Input.Keyboard.JustDown(this.resumeKey)) {
            this.scene.resume('gamelevel');
            this.scene.stop('settings');
        }

    }

}