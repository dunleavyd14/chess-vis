//in part taken from chessboard.js docs
const game = new Chess()

function onDragStart (source, piece, position, orientation) {
	if (game.game_over()) return false

	if ((game.turn() === "w" && piece.search(/^b/) !== -1) ||
		(game.turn() === "b" && piece.search(/^w/) !== -1)) {
		return false
	}
}

function onDrop (source, target) {
	const move = game.move({
		from: source,
		to: target,
		promotion: "q" // for simplicity
	})

	if (move === null) return 'snapback'
}

function onSnapEnd () {
	board.position(game.fen())
}

const config = {
	draggable: true,
	position: "start",
	onDragStart: onDragStart,
	onDrop: onDrop,
	onSnapEnd: onSnapEnd
}

window.onload = () => {
	const board = Chessboard("board", config)
}
