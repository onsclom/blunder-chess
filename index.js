import {
  INPUT_EVENT_TYPE,
  COLOR,
  Chessboard,
  MARKER_TYPE
} from "./cm-chessboard/Chessboard.js"
const chess = new Chess()

const board = new Chessboard(document.getElementById("board"), {
  position: chess.fen(),
  sprite: {
    url: "../assets/images/chessboard-sprite-staunty.svg"
  },
  style: {
    moveMarker: MARKER_TYPE.square,
    hoverMarker: undefined
  },
  orientation: COLOR.white
})
board.enableMoveInput(inputHandler)

const move_increment = 500

let correct = 0
let wrong = 0

let levels = []
let cur_answer = ""
let is_scored = true
let puzzle

//for making set interval moves
let cur_state_id = 0

//load puzzles
fetch('output.txt')
  .then(response => response.text())
  .then(text => {
    levels = text.split("\n")
    levels.pop() //last element is empty, so can remove
    loadPuzzle()
  })

function show_mate() {
  let count = 1
  let state = cur_state_id

  for (let move of puzzle["mate_moves"].split(" ")) {

    setTimeout(() => {
      make_move(state, move)
    }, move_increment * count)

    count += 1
  }
}

function make_move(state_id, move) {
  console.log("old state id: " + state_id)
  console.log("new state: " + cur_state_id)
  if (cur_state_id == state_id) {

    chess.move(move, {
      sloppy: true
    })
    board.setPosition(chess.fen())
  }
}

function loadPuzzle() {
  cur_state_id += 1
  is_scored = true
  let number = Math.floor(Math.random() * levels.length)
  puzzle = JSON.parse(levels[number])
  console.log(puzzle)
  chess.load(puzzle.fen)
  board.setPosition(puzzle.fen)

  board.setOrientation(chess.turn() == 'w' ? COLOR.white : COLOR.black)

  if (chess.turn() == 'w') {
    document.getElementById('status').innerText = "white to blunder"
    document.getElementById('statusBar').className = ""
    document.getElementById('statusBar').classList.add("white-to-move")
  } else {
    document.getElementById('status').innerText = "black to blunder"
    document.getElementById('statusBar').className = ""
    document.getElementById('statusBar').classList.add("black-to-move")
  }

  cur_answer = puzzle.answer
  document.getElementById("puzzleIdP").innerHTML = "puzzle #" + number.toString()
  document.getElementById("puzzleText").innerHTML = "blunder into a mate in " + Math.abs(puzzle.mate_in)

  board.enableMoveInput(inputHandler)
}

function inputHandler(event) {
  console.log("event", event)
  event.chessboard.removeMarkers(undefined, MARKER_TYPE.dot)
  if (event.type === INPUT_EVENT_TYPE.moveStart) {
    const moves = chess.moves({
      square: event.square,
      verbose: true
    });
    for (const move of moves) {
      event.chessboard.addMarker(move.to, MARKER_TYPE.dot)
    }
    return moves.length > 0
  } else if (event.type === INPUT_EVENT_TYPE.moveDone) {
    const move = {
      from: event.squareFrom,
      to: event.squareTo
    }
    const result = chess.move(move)
    if (result) {
      event.chessboard.disableMoveInput()
      event.chessboard.setPosition(chess.fen())
      const possibleMoves = chess.moves({
        verbose: true
      })

      //wow valid move inputted!
      if (move.from + move.to == cur_answer) {
        console.log("CORRECT")
        document.getElementById('status').innerText = "✔ correct"
        document.getElementById('statusBar').className = ""
        document.getElementById('statusBar').classList.add("correct")

        if (is_scored)
          correct += 1
        
        show_mate()
        document.getElementById('winButtons').style.display = "flex";
      } else {
        console.log("WRONG")
        document.getElementById('status').innerText = "✘ incorrect"
        document.getElementById('statusBar').className = ""
        document.getElementById('statusBar').classList.add("wrong")

        if (is_scored)
          wrong += 1

        document.getElementById('loseButtons').style.display = "flex";
      }

      document.getElementById('correctText').innerHTML = "correct: " + correct;
      document.getElementById('wrongText').innerHTML = "wrong: " + wrong;
    } else {
      console.warn("invalid move", move)
    }
    return result
  }
}

document.getElementById("retryButton").addEventListener("click", () => {
  cur_state_id += 1
  chess.load(puzzle.fen)
  board.setPosition(puzzle.fen)
  is_scored = false
  board.enableMoveInput(inputHandler)

  if (chess.turn() == 'w') {
    document.getElementById('status').innerText = "white to blunder"
    document.getElementById('statusBar').className = ""
    document.getElementById('statusBar').classList.add("white-to-move")
  } else {
    document.getElementById('status').innerText = "black to blunder"
    document.getElementById('statusBar').className = ""
    document.getElementById('statusBar').classList.add("black-to-move")
  }

  document.getElementById('loseButtons').style.display = "none";
})

document.getElementById("loseNextButton").addEventListener("click", () => {
  loadPuzzle();
  document.getElementById('loseButtons').style.display = "none";
})
document.getElementById("winNextButton").addEventListener("click", () => {
  loadPuzzle();
  document.getElementById('winButtons').style.display = "none";
})
document.getElementById("tellSolution").addEventListener("click", () => {
  document.getElementById('status').innerText = "the solution was " + puzzle.answer

  chess.load(puzzle.fen)
  board.disableMoveInput()
  board.setPosition(chess.fen())

  let old_id = cur_state_id

  setTimeout(() => {
    if (old_id == cur_state_id) {
      chess.move(cur_answer, {
        sloppy: true
      })
      board.setPosition(chess.fen())

      show_mate()
    }
  }, move_increment);
})