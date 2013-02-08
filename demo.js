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
        jump: 15
    }
})

game.controls.pitchObject.rotation.x = -1.5;
game.appendTo('#container');
window.game = game;

var tetris = require('voxel-tetris')(game);

game.on('mousedown', function (pos) {
    tetris.touch(pos);
});

game.on('tick', function() {
  tetris.tick();
});

// obtain pointer lock
container.addEventListener('click', function() {
    game.requestPointerLock(container);
});

