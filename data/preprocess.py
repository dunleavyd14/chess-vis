import chess
import chess.pgn
import os
import json
from tqdm import tqdm

MAX_DEPTH = 15

class MoveMap:
	def __init__(self):
		self._dict = {}
	
	def set(self, key, value):
		"""key is boardstate, value is move"""
		if key in self._dict:
			if value in self._dict[key]:
				self._dict[key][value] += 1
			else:
				self._dict[key][value] = 1
			self._dict[key]["total"] += 1
		else:
			self._dict[key] = {"total": 1}
			self._dict[key][value] = 1

	def json(self):
		with open("data.json", "w") as f:
			json.dump(self._dict, f, indent=4)

def collect_from_game(game, move_map):
	board = chess.Board()
	for _, move in zip(range(MAX_DEPTH), game.mainline_moves()):
		move_map.set(board.fen(), move.uci())
		board.push(move)
	


if __name__ == "__main__":
	move_map = MoveMap()
	for fname in tqdm(os.listdir("./pgn")):
		with open(f"./pgn/{fname}", encoding="utf-8", errors="ignore") as pgn:
			while True:
				game = chess.pgn.read_game(pgn)

				if not game:
					break

				collect_from_game(game, move_map)

	move_map.json()

















