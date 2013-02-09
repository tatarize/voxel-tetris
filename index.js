
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
    if (!opts.droprate) opts.droprate = 25;
    if (!opts.levels) opts.levels = [1,5,10,25,50,100,200,500,1000,50000];
    if (!opts.speedincrease) opts.speedincrease = 0.20;
    
    var voxels = game.voxels;
    var size = voxels.cubeSize;
    
    var pieces = [];
    var droplocation;
    var droprate = opts.droprate;
    var time = 0;
    var rowsremoved = 0;
      
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
            case 4:
                moveDown(pindex);
                break;
            case 5:
                slam(pindex);
                break;
        }
    }
    this.slam = function(pindex) {
        if (!pindex) pindex = 0;
        var piece = pieces[pindex];
        unshow(piece);
        do {
            piece.dy -= 1; 
            reposition(piece);
        } while (isValid(piece));
        piece.dy += 1;
        reposition(piece);
        show(piece);
        flush();
        checkRows();
        pieces.pop();
    }
    this.moveDown = function(pindex) {
        if (!pindex) pindex = 0;
        move(pindex,0,-1,0,function() {
            checkRows();
            pieces.pop();
        });
    }
    
    this.touch = function(pos) {
        if (pos.y < (opts.pos.y - size)) {
            command(5);
            return;
        }
        if (pos.y < opts.pos.y) {
            command(4);
            return;
        }
        if (pos.x > (opts.pos.x + (opts.width*size))) {
            command(2);
            return;
        }
        if (pos.x < (opts.pos.x)) {
            command(3);
            return;
        }
        command(0); //no longer turn the other direction.
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
            return false;
        }
        else {
            show(piece);
        }
        flush();
        return true;
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
            return false;
        }
        else {
            show(piece);
        }
        flush();
        return true;
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
        rowsremoved++;
        checkLevel();
        flush();
    }
    this.checkLevel  = function() {
        for (var i = 0; i < opts.levels.length; i++) {
            if (rowsremoved == opts.levels[i]) {
                setBoard(i);
                faster();
                return;
            }
            if (rowsremoved < opts.levels[i]) {
                return;
            }
        }
    }
    this.gameOver = function() {
        clearBoard();
        resetSpeed();
        setBoard(opts.material);
        rowsremoved = 0;
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
            moveDown(i);
        }
    }
    this.tick = function () {
        time++;
        if (time % droprate == 0) {
            doTick();
        }
    }
    this.faster = function() {
        droprate = Math.ceil(droprate * (1-opts.speedincrease));
    }
    this.slower = function() {
        droprate = Math.ceil(droprate * (1-opts.speedincrease));
    }
    this.resetSpeed = function() {
        droprate = opts.droprate;
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
    this.setBoard = function(material) {
        var x = opts.pos.x, y = opts.pos.y, z = opts.pos.z;
        if (!material) material = opts.material;
        
        for (var m = -1; m <= opts.height; m++) {
            set({
                x: x -1,                
                y: y+size*m, 
                z: z
            }, material);
            set({
                x: x + size*opts.width, 
                y: y+size*m, 
                z: z
            }, material);
        }
        for (var q = -1; q <= opts.width; q++) {
            set({
                x: x + size * q , 
                y: y - 1*size, 
                z: z
            }, material);
        }
    }
    
    this.setDroplocation = function(x,y,z) {
        droplocation = {
            x: x, 
            y: y, 
            z: z
        };
    }
    this.makeBoard = function() {
        var x = opts.pos.x, y = opts.pos.y, z = opts.pos.z;
        clearBoard();
        setBoard(opts.material);
        setDroplocation(x + (opts.width * size)/2,y + (opts.height * size),z);
        flush();
    }

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
            gameOver();
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
    
    
        
    makeBoard();
    return this;
};
