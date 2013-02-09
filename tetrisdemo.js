var createGame = require('voxel-engine')
var chunkSize = 32
var chunkDistance = 3

var game = createGame({
    texturePath: '/textures/',
materials: [['grass', 'dirt', 'grass_dirt'], 'brick', 'dirt', 'obsidian', 'whitewool', 'cobblestone'],
    generate: function(x,y,z) {
        return (y < -2 && Math.abs(x) < 100 && Math.abs(z) < 100) ? 1 : 0
    },
    controlOptions: {
      jump: 0,
      move: 0,
      fall: 0
    },
  startingPosition:[125,250,400]
})

var container = document.body
game.appendTo(container);
window.game = game;

var tetris = require('voxel-tetris')(game);

game.on('mousedown', function (pos) {
    tetris.touch(pos);
});

game.controls.on('command', function(cmd) {
  switch(cmd) {
    case 'moveForward':
      tetris.command(0);
      break;
    case 'moveLeft':
      tetris.command(3);
      break;
    case 'moveRight':
      tetris.command(2);
      break;
    case 'moveBackward':
	 tetris.command(4);
	 break;
    case 'wantsJump':
      tetris.command(5);
      break;
  }
});

game.on('tick', function() {
  tetris.tick();
});

// obtain pointer lock
game.setupPointerLock(container)