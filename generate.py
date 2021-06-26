import chess #https://python-chess.readthedocs.io/en/latest/
from stockfish import Stockfish #https://pypi.org/project/stockfish/
import random
import json

output_file = open("output.txt", "a")

#must download stockfish and point to stockfish executeable on your PC
stockfish = Stockfish("/usr/local/Cellar/stockfish/12/bin/stockfish")


games_to_gen = 100
games_genned = 0
while games_genned < games_to_gen:
    board = chess.Board()
    moves_to_do = random.randrange(30,50)
    moves_done = 0
    while moves_done < moves_to_do and board.is_game_over() == False:
        list_of_possible_moves = []
        for move in board.legal_moves:
            list_of_possible_moves.append(move)
        move = random.choice(list_of_possible_moves)
        board.push(move)
        moves_done += 1
        
    # this is our randomized fen!
    rand_fen = board.fen()
    stockfish.set_fen_position(rand_fen)
    legal_move_count = board.legal_moves.count()
    
    # If there is atleast two moves and the worst move is the only one that causes mate,
    # then its a good puzzle!
    if legal_move_count > 1:
        evaled_moves = stockfish.get_top_moves(legal_move_count)
        if evaled_moves[-1]["Mate"] != None:
            if evaled_moves[-2]["Mate"] == None:
                print(rand_fen)
                print(evaled_moves)
                games_genned+=1
                
                puzzle = {
                    "fen": rand_fen,
                    "mate_in": str(evaled_moves[-1]["Mate"]),
                    "answer": evaled_moves[-1]["Move"]
                }
                
                output_file.write( str( json.dumps(puzzle) ) + "\n")
                
output_file.close()