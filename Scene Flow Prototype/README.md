# Core gameplay prototype

## Scene types
* Main title scene: first scene that displays
* Credits scene: Click "Credits" to view
* Gameplay scene: Click "Start", "1 Player" to view
* Menu scene: Click "Settings" from first scene OR press ESC after entering gameplay to access settings

## Communication between scenes
* Players picking up items persists across scenes
You can view player 1's inventory by typing `players[0].items` in the console, or `players[0].slots` to view currently equiped items. Defined on line 47 of `game.js`
Also the global variable "levels" is used to keep track of items picked up and door connections per level. Defined on line 46 of `game.js`

## Reachability
* SetupLevel is loaded once at the very start to load all assets, invisible to the player
* Open, Menu, Lore, MusicScene load before gameplay
* GameLevel, UI load as gameplay starts
* Settings, Inventory are accessable by pressing ESC after gameplay starts

## Transitions
* Opening the ESC menu after starting gameplay pauses the gameplay scene to open the inventory, then resumes it.
