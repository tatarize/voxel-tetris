Voxel Tetris
----------------

The first fully implemented voxel.js game.

Click the board side to make the piece go that way.

Click something on the board (eg, the falling piece) to make it turn.

Options:
---------------
.width controls width of board.
.height controls height of board.
.droprate controls initial drop rate.
.levels [], rows at which levels increases.
.speedincrease, between [0,1) increase speed each level (default .2)


API:
---------------
tetris.command(command)
0: spin clockwise?
1: spin counterclockwise?
2: move right?
3: move left?
4: move down.
5: slam down.
      
tetris.touch(pos)
Feed a position produced by mouse event allows control of game via mouse.

Click below board, slam.
Click bottom of board, move down.
Click right or left edge, move right or left.
Click something on board, command(0), turn.

tetris.move(pieceindex, x, y, z, failop)

Moves peice given by pieceindex (typically 0), by block worth of x,y,z (moving z would push the peice off the board).

Failop is optional function to be called if the operation collides with other blocks and must abort.


tetris.removerow(m)
M is row to be removed counting from bottom.

tetris.faster() increases speed by speedincrease (default 20%)

tetris.slower() decrease speed by speedincrease (default 20%)

tetris.resetSpeed() set drop rate back to initial droprate.

tetris.clearBoard() remove all peices from the board.

tetris.setBoard(material) changes board material to material index.

tetris.setDroplocation(x,y,z) sets drop location for peices to this location.

