
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
      
    this.command = function(c,pindex) {
        if (!pindex) pindex = 0;
            switch(c){
                case 0:
                    spin(pindex,1);
                    break;
                case 1:
                    spin(pindex,-1);
                    break;
                case 2:
                    move(pindex,1,0,0);
                    break;
                case 3:
                    move(pindex,-1,0,0);
                    break;
            }
    }
    this.touch = function(pos) {
        if (pos.x > (opts.pos.x + (opts.width*size))) {
            command(2);
            return;
        }
        if (pos.x < (opts.pos.x)) {
            command(3);
            return;
        }
        var face = Math.abs(Math.floor(pos.y))%2;
        command(face);
    }
    this.spin = function(pindex, cw, failop) {
        var piece = pieces[pindex];
        unshow(piece);
        piece.spin += cw;
        reposition(piece);
        if (!isValid(piece)) {
            piece.spin -= cw;
            reposition(piece);
            show(piece);
            if (failop) failop();
        }
        else {
            show(piece);
        }
        flush();
    }
        
    this.move = function (pindex, mx, my, mz, failop) {
        var piece = pieces[pindex];
        unshow(piece);
        piece.dx += mx;
        piece.dy += my;
        piece.dz += mz;
        reposition(piece);
        if (!isValid(piece)) {
            piece.dx -= mx;
            piece.dy -= my;
            piece.dz -= mz;    
            reposition(piece);
            show(piece);
            if (failop) failop();
        }
        else {
            show(piece);
        }
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
                set({
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
        for (var m = 0; m < opts.height+5; m++) {
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
        if (!type) type = Math.floor((Math.random() * 7));
        var piece = [];
        switch (type) {
            case 0: //block
                piece = [{corex: 0, corey: 0, corez: 0}, {corex: 0, corey: 1, corez: 0},{corex: 1, corey: 0, corez: 0},{corex: 1, corey: 1, corez: 0}]
                break;

            case 1: //long
                piece = [{corex: -1, corey: 0, corez: 0}, {corex: 0, corey: 0, corez: 0},{corex: 1, corey: 0, corez: 0},{corex: 2, corey: 0, corez: 0}]
                break;

            case 2: //L
                piece = [{corex: 0, corey: -2, corez: 0}, {corex: 0, corey: -1, corez: 0},{corex: 0, corey: 0, corez: 0},{corex: 1, corey: 0, corez: 0}]
                break;

            case 3: //Inverted L
                piece = [{corex: 0, corey: -2, corez: 0}, {corex: 0, corey: -1, corez: 0},{corex: 0, corey: 0, corez: 0},{corex: -1, corey: 0, corez: 0}]
                break;

            case 4: //T
                piece = [{corex: -1, corey: 0, corez: 0}, {corex: 0, corey: 0, corez: 0},{corex: 1, corey: 0, corez: 0},{corex: 0, corey: 1, corez: 0}]
                break;

            case 5://S
                piece = [{corex: 0, corey: 1, corez: 0}, {corex: 0, corey: 0, corez: 0},{corex: -1, corey: 0, corez: 0},{corex: -1, corey: -1, corez: 0}]
                break;

            case 6://Inverted S
                piece = [{corex: 0, corey: 1, corez: 0}, {corex: 0, corey: 0, corez: 0},{corex: 1, corey: 0, corez: 0},{corex: 1, corey: -1, corez: 0}]
                break;
        }
        piece.material = type+1;
        piece.initx = pos.x;
        piece.inity = pos.y;
        piece.initz = pos.z;
        piece.dx = 0;
        piece.dy = 0;
        piece.dz = 0;
        piece.spin = 0;
        reposition(piece);
        if (!isValid(piece)) {
            clearBoard();
        }
        show(piece);
        if (!pieces) pieces = [];
        pieces.push(piece);
        flush();
    }
    
    this.reposition = function(piece) {
        for (var i = 0; i < piece.length; i++) {
            var block = piece[i];
            var nx;
            var ny;
            var nz = block.corez;
            var spin = piece.spin;
            while (spin < 0) spin+=4;
            spin %= 4;
            switch (spin) {
                case 0:
                    nx = block.corex;
                    ny = block.corey;
                    break;            
                case 1:
                    nx = block.corey;
                    ny = -block.corex;
                    break;
                case 2:
                    nx = -block.corex;
                    ny = -block.corey;
                    break;
                case 3:
                    nx = -block.corey;
                    ny = block.corex;
            }
            block.x = ((nx + piece.dx) * size) + piece.initx;
            block.y = ((ny + piece.dy) * size) + piece.inity;
            block.z = ((nz + piece.dz) * size) + piece.initz;
        }
    }
    
    var show = function(piece) {
        for (var i = 0; i < piece.length; i++) {
            set(piece[i],piece.material);
        }
    }
    
    var unshow = function(piece) {
        for (var i = 0; i < piece.length; i++) {
            set(piece[i],0);
        }
    }

    
    function isValid(piece) {
        for (var i = 0; i < piece.length; i++) {
            if (voxels.voxelAtPosition(piece[i])) return false;
        }
        return true;
    }
    
    function set (posxyz, value) {
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
