//in part taken from chessboard.js docs
const game = new Chess()

let board = null;

fetch("data/data.json")
	.then(response => response.json())
	.then(dataset => {


		const callbacks = {
			afterMove : null,
			onSelect : null
		}

		function onDragStart (source, piece, position, orientation) {
			if (callbacks.onSelect) callbacks.onSelect(source)
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

			console.log(probMap)

			probMap.forEach( (count, square, map) => {
				d3.select(`.square-${square}`)
					.style("background-color", d3.interpolateViridis(Math.sqrt(count/total)))
			})
		}

		function colorMoveProbabilities(source) {
			resetBoardColors()
			const {total, data} = dataset[board.fen()]

			let probMap = d3.rollup(
				data.filter(x => x.start === source),
				g => d3.sum(g, d => d.count), 
				d => d.end
			)

			probMap.forEach( (count, square, map) => {
				d3.select(`.square-${square}`)
					.style("background-color", d3.interpolateViridis(Math.sqrt(count/total)))
			})
		}

		function showScale() {
			const margin = {top: 20, bottom: 20, right: 5}
			const height = 500 - margin.top - margin.bottom
			const width = 20
			const svg = d3.select("#scale")
				.append("svg")
				.attr("height", height + margin.top + margin.bottom)
			const data = Array.from(Array(height).keys())
			
			svg.selectAll("rect")
				.data(data)
				.enter()
				.append("rect")
					.attr("height", 1)
					.attr("x", 0)
					.attr("y", d => height - d + margin.bottom)
					.attr("width", width)
					.style("fill", d => d3.interpolateViridis(Math.sqrt(d/height)))

			svg.append("text")
				.attr("x", width + margin.right)
				.attr("y", height + margin.bottom)
				.text("0%")

			svg.append("text")
				.attr("x", width + margin.right)
				.attr("y", margin.top + 10)
				.text("100%")
			
			svg.append("text")
				.attr("x", width + margin.right)
				.attr("y", (height + margin.top + margin.bottom)/2)
				.text("50%")

		}

		showScale()

		callbacks.afterMove = colorPieceProbabilities
		callbacks.onSelect = colorMoveProbabilities


		board = Chessboard("board", config)
	})


