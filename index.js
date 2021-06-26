var board = null
var game = new Chess()
var $status = $('#status')
var $fen = $('#fen')

let correct = 0
let wrong = 0

let levels = []
let cur_answer = ""

//load puzzles
fetch('output.txt')
    .then(response => response.text())
    .then(text => {
        levels = text.split("\n")
        levels.pop() //last element is empty, so can remove
        console.log(levels)
        loadPuzzle()
    })


function loadPuzzle () {
    let number = Math.floor(Math.random()*levels.length)
    const puzzle = JSON.parse( levels[number] )
    console.log(puzzle)
    game.load(puzzle.fen)
    updateStatus()
    board.position(puzzle.fen)
    cur_answer = puzzle.answer
    document.getElementById("puzzleIdP").innerHTML = "puzzle #"+number.toString()
    document.getElementById("puzzleText").innerHTML = "blunder into a mate in " + Math.abs(puzzle.mate_in)
}

function onDragStart (source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // only pick up pieces for the side to move
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
}

function onDrop (source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback'
  else {
    let input_answer = source+target
      
    if (cur_answer != "") {

        if (cur_answer == input_answer) {
            console.log("correct!")
            correct += 1

            let boardClasses = document.getElementById("myBoard").classList;
            boardClasses.add("correct")

            setTimeout(()=>boardClasses.value="", 1000);
            
        }
        else {
            console.log("wrong!")
            wrong += 1

            let boardClasses = document.getElementById("myBoard").classList;
            boardClasses.add("wrong")

            setTimeout(()=>boardClasses.value="", 1000);
        }

        cur_answer = "" //this will deny double submissions
        loadPuzzle ()
    }
  }

  updateStatus()
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
}

function updateStatus () {
  var status = ''

  var moveColor = 'White'
  if (game.turn() === 'b') {
    board.orientation('black')
    moveColor = 'Black'
  }
  else {
    board.orientation('white')
  }

  // checkmate?
  if (game.in_checkmate()) {
    status = 'Game over, ' + moveColor + ' is in checkmate.'
  }

  // draw?
  else if (game.in_draw()) {
    status = 'Game over, drawn position'
  }

  // game still on
  else {
    status = moveColor + ' to move'

    // check?
    if (game.in_check()) {
      status += ', ' + moveColor + ' is in check'
    }
  }

  document.getElementById("status").innerHTML = status
  $fen.html(game.fen())

  document.getElementById("correctText").innerHTML = "correct: " + correct.toString()
  document.getElementById("wrongText").innerHTML = "wrong: " + wrong.toString()
}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
}

board = Chessboard('myBoard', config)
updateStatus()
