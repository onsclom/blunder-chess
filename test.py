from stockfish import Stockfish #https://pypi.org/project/stockfish/
stockfish = Stockfish(parameters={"Hash": 256, "Contempt": 0, "Slow Mover": 999999999, "Min Split Depth": 1, "Write Debug Log":"true", "MultiPV": 1,"Threads": 8, "Minimum Thinking Time": 10000, "Ponder": "false"})



#stockfish.set_fen_position("1r2kbn1/1pp1pp2/p6q/B2pn1pP/5P2/1B1P3P/Pr6/RNNK3R w - - 5 23")
stockfish.set_fen_position("1r2kbn1/1pp1pp2/p6q/B2pn1pP/3P1P2/1B5P/Pr6/RNNK3R b - - 0 23")
evaled_moves = stockfish.get_top_moves(200)
print(evaled_moves)
print(stockfish.get_parameters())
print( stockfish.get_board_visual() )
print(stockfish.get_evaluation())

cur_eval = stockfish.get_evaluation()
while cur_eval["type"]!="mate":
    cur_eval = stockfish.get_evaluation()
    print(cur_eval)