
module.exports = function(game,opts) {
    var updated = {};
    if (!opts) opts = {};
    if (!opts.pos) opts.pos = {
        x:0,
        y:0,
        z:0
    };
    if (!opts.width) opts.width = 10;
    if (!opts.height) opts.height = 20;
    if (!opts.material) opts.material = 1;
    if (!opts.droprate) opts.droprate = 10;
    
    var voxels = game.voxels;
    var size = voxels.cubeSize;
    
    var pieces = [];
    var droplocation;
    var time = 0;
  
  
    //TODO: Check Collide Spin.
    //TODO: Line vanish on complete.
    //TODO: Game Over on Fail.
    this.spin = function(pindex, cw) {
        if (!pieces) return;
        if (pieces.length == 0) return;
        if (pieces.length <= pindex) return;
        var piece = pieces[pindex];
        if (!cw) cw = 1;
        unshow(piece);
        for (var i = 0; i < piece.length; i++) {
            var nx = piece[i].corey * cw;
            var ny = -piece[i].corex * cw;
            piece[i].corex = nx;
            piece[i].corey = ny;
            repos(piece[i]);
        }
        show(piece);
        flush();
    }
    
    this.removeRow = function(m) {
        for (var r = 0; r < opts.width; r++) {
            set({
                x: opts.pos.x + (r * size), 
                y: opts.pos.y + (m * size), 
                z: opts.pos.z
            },0);
        }
        for (var k = m; k < opts.height; k++) {
            for (var j = 0; j < opts.width; j++) {
                voxels.voxelAtPosition({
                    x: opts.pos.x + (j * size), 
                    y: opts.pos.y + (k * size), 
                    z: opts.pos.z
                },voxels.voxelAtPosition({
                    x: opts.pos.x + (j * size), 
                    y: opts.pos.y + ((k+1) * size),
                    z: opts.pos.z
                })); 
            }
        }
        flush();
    }
    this.checkRows = function() {
        var row;
        for (var m = 0; m < opts.height; m++) {
            row = true;
            for (var n = 0; n < opts.width; n++) {
                if (!voxels.voxelAtPosition({
                    x: opts.pos.x + (n * size), 
                    y: opts.pos.y + (m * size), 
                    z: opts.pos.z
                })) {
                    row = false;
                    break;
                }
            }
            if (row) {
                removeRow(m);
                m--;
            }
        }
    }
    
    this.doTick = function() {
        if ((!pieces) || pieces.length == 0) {
            makePiece();
        }

        if (!pieces) return;
        for (var i = 0; i < pieces.length; i++) {
            move(i,0,-1,0,function() {
                checkRows();
                pieces.pop();
            });
        }
    }
    this.tick = function () {
        time++;
        if (time % 25 == 1) {
            doTick();
        }
    }
    this.clearBoard = function() {
        var x = opts.pos.x, y = opts.pos.y, z = opts.pos.z;
        for (var m = 0; m < opts.height; m++) {
            for (var n = 0; n < opts.width; n++) {
                set({
                    x: x + size*n , 
                    y: y+size*m, 
                    z: z
                },0);
            }
        }
    }
    
    this.makeBoard = function() {
        var x = opts.pos.x, y = opts.pos.y, z = opts.pos.z;
        clearBoard();
        
        for (var m = -1; m <= opts.height; m++) {
            set({
                x: x -1,                
                y: y+size*m, 
                z: z
            }, opts.material);
            set({
                x: x + size*opts.width, 
                y: y+size*m, 
                z: z
            }, opts.material);
        }
        for (var q = -1; q <= opts.width; q++) {
            set({
                x: x + size * q , 
                y: y - 1*size, 
                z: z
            }, opts.material);
        }
        droplocation = {
            x: x + (opts.width * size)/2, 
            y: y+(opts.height * size), 
            z: z
        };
        flush();
    }
    
    makeBoard();  
        
    this.makePiece = function(pos, type) {
        if (!pos) pos = droplocation;
        if (!type) type = Math.floor(Math.random() * 4) % 7;
        var piece = [];
        switch (type) {
            case 1:
            case 2:
            case 3:
            case 0:
                piece[0] = {
                    corex: -1, 
                    corey: 0,
                    corez: 0
                };
                piece[1] = {
                    corex: 0, 
                    corey: 0,
                    corez: 0
                };
                piece[2] = {
                    corex: 1, 
                    corey: 0,
                    corez: 0
                };
                piece[3] = {
                    corex: 2, 
                    corey: 0,
                    corez: 0
                };
                break;
        }
        for (var i = 0; i < piece.length; i++) {
            piece[i].initx = pos.x;
            piece[i].inity = pos.y;
            piece[i].initz = pos.z;
            piece[i].dx = 0;
            piece[i].dy = 0;
            piece[i].dz = 0;
            repos(piece[i]);
        }
        show(piece);
        if (!pieces) pieces = [];
        pieces.push(piece);
        flush();
    }
    
    var reposition = function(piece) {
        for (var i = 0; i < piece.length; i++) {
            repos(piece[i]);
        }
    }
    
    var repos = function(block) {
        block.x = ((block.corex + block.dx) * size) + block.initx;
        block.y = ((block.corey + block.dy) * size) + block.inity;
        block.z = ((block.corez + block.dz) * size) + block.initz;
    }
    
    var show = function(piece) {
        for (var i = 0; i < piece.length; i++) {
            set(piece[i],1);
        }
    }
    
    var unshow = function unshow(piece) {
        for (var i = 0; i < piece.length; i++) {
            set(piece[i],0);
        }
    }
    
    this.move = function (pindex, mx, my, mz, failop) {
        var piece = pieces[pindex];
        unshow(piece);
        if (checkCollide(piece,mx,my,mz)) {
            show(piece);
            flush();
            if (failop) failop();
            return;
        }
        for (var i = 0; i < piece.length; i++) {
            piece[i].dx += mx;
            piece[i].dy += my;
            piece[i].dz += mz;
        }
        reposition(piece);
        show(piece);
        flush();
    }
    
    function checkCollide(piece, dx, dy, dz) {
        for (var i = 0; i < piece.length; i++) {
            if (voxels.voxelAtPosition({
                x: piece[i].x + (dx * size), 
                y: piece[i].y + (dy * size), 
                z: piece[i].z + (dz * size)
            })) return true;
        }
        return false; 
    }
    
    this.touch = function(pos) {
        var face = Math.floor(pos.y/size) % 4;
        for (var i = 0; i < pieces.length; i++) {
            switch(face){
                case 0:
                    spin(i,1);
                    break;
                case 1:
                    spin(i,-1);
                    break;
                case 2:
                    move(i,1,0,0);
                    break;
                case 3:
                    move(i,-1,0,0);
                    break;
            }
        }
    }
    
    function set (posxyz, value) {
        var ex = voxels.voxelAtPosition(posxyz);
        if (ex) true;
        voxels.voxelAtPosition(posxyz, value);
        var c = voxels.chunkAtPosition(posxyz);
        var key = c.join('|');
        if (!updated[key] && voxels.chunks[key]) {
            updated[key] = voxels.chunks[key];
        }
    }
    
    function flush() {
        Object.keys(updated).forEach(function (key) {
            game.showChunk(updated[key]);
        });
    }
    
    return this;
};
