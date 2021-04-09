//in part taken from chessboard.js docs
const game = new Chess()

let board = null;

fetch("data/data.json")
	.then(response => response.json())
	.then(dataset => {
		callbacks = {
			afterMove : null
		}

		function onDragStart (source, piece, position, orientation) {
			if (game.game_over()) return false

			if ((game.turn() === "w" && piece.search(/^b/) !== -1) ||
				(game.turn() === "b" && piece.search(/^w/) !== -1)) {
				return false
			}
		}

		function onDrop (source, target) {
			console.log(source, target)
			const move = game.move({
				from: source,
				to: target,
				promotion: "q" // for simplicity although shouldn't really matter
			})

			if (move === null) return 'snapback'
		}

		function onSnapEnd () {
			board.position(game.fen())

			if (callbacks.afterMove) callbacks.afterMove()
		}

		const config = {
			draggable: true,
			position: "start",
			onDragStart: onDragStart,
			onDrop: onDrop,
			onSnapEnd: onSnapEnd
		}

		function resetBoardColors() {
			//callback always takes rank and file as input
			const ranks = [1, 2, 3, 4, 5, 6, 7, 8]
			const files = ["a", "b", "c", "d", "e", "f", "g", "h"]

			for (r of ranks) {
				for (f of files) {
					const color = ((r + f.charCodeAt(0)) % 2) ? "#f0d9b5" : "#b58863"
					d3.select(`.square-${f}${r}`)
						.style("background-color", color)
				}
			}
		}

		function colorPieceProbabilities() {
			resetBoardColors()
			const {total, data} = dataset[board.fen()]
			let probMap = d3.rollup(data, g => d3.sum(g, d => d.count), d => d.start)


			probMap.forEach( (count, square, map) => {
				d3.select(`.square-${square}`)
					.style("background-color", d3.interpolateViridis(Math.sqrt(count/total)))
			})
		}


		callbacks.afterMove = colorPieceProbabilities


		board = Chessboard("board", config)
	})

