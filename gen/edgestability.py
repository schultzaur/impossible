BOARD_SIZE = 8
ROW_COMBINATIONS = 3 ** BOARD_SIZE
EMPTY = 0
BLACK = 1
WHITE = 2
UNSTABLE = 0
SEMI_STABLE = 1
STABLE = 2

def pieces_to_a(pieces, chars):
    s = ""
    for i in range(8):
        s += chars[pieces[i]]
    return s

def i_to_pieces(i):
    if not 0 <= i < ROW_COMBINATIONS:
        raise Exception("input out of range.")

    pieces = [0] * 8

    for digit in range(8):
        pieces[7-digit] = i % 3
        i //= 3

    return pieces

def pieces_to_i(pieces):
    if len(pieces) != 8:
        raise Exception("input out of range.")
    i = 0
    for piece in pieces:
        i = (i * 3) + piece
    return i

memo = [None] * (3 ** BOARD_SIZE)
def get_row_key(key):
    if memo[key] is None:
        memo[key] = Row(key=key)

    return memo[key]

def get_row(pieces):
    return get_row_key(pieces_to_i(pieces))

class Row(object):
    def __init__(self, pieces=None, key=None):
        if pieces is not None:
            self.pieces = pieces
            self.key = pieces_to_i(pieces)
        elif key is not None:
            self.pieces = i_to_pieces(key)
            self.key = key
        else:
            raise Exception("Need either pieces or key.")

        self.stability = [0] * 8
        self.set_stability()

    def __str__(self):
        return f"{pieces_to_a(self.pieces, ['-','B','W'])}|{self.key:04}|{pieces_to_a(self.stability,['-','s','S'])}"

    def set_stability(self):
        next_rows = []

        if all(piece != EMPTY for piece in self.pieces):
            self.stability = [STABLE] * 8
            return

        for c in range(8):
            if self.pieces[c] == EMPTY:
                next_rows.append(self.move(c, BLACK))
                next_rows.append(self.move(c, WHITE))

        for c in range(8):
            if all(row.pieces[c] == self.pieces[c] for row in next_rows):
                if all(row.stability[c] == STABLE for row in next_rows):
                    self.stability[c] = STABLE
                else:
                    self.stability[c] = SEMI_STABLE

    def move(self, column, color):
        new_pieces = self.pieces[::]
        new_pieces[column] = color

        opposite_color = BLACK + WHITE - color

        cap = column + 1
        while cap < 8 and new_pieces[cap] == opposite_color:
            cap += 1

        if cap < 8 and new_pieces[cap] == color:
            for c in range(column + 1, cap):
                new_pieces[c] = color

        cap = column - 1
        while cap >= 0 and new_pieces[cap] == opposite_color:
            cap -= 1

        if cap >= 0 and new_pieces[cap] == color:
            for c in range(cap + 1, column):
                new_pieces[c] = color

        return get_row(new_pieces)

for i in range(len(memo)-1, -1, -1):
    get_row_key(i)


# https://www.labri.fr/perso/fleury/courses/pdp/Board_Games/Reversi/World-championship-level_othello_program.pdf
# Corner 700 * *
# C-Square 1200 200 -25
# A-Square 1000 200  75
# B-Square 1000 200  50
# That paper users these numbers quite a bit differently, but this is just a starting point.

SQUARE_WEIGHTS = [None, None, None]
SQUARE_WEIGHTS[UNSTABLE] =    [   0,  -25,   75,   50,   50,   75,  -25,    0]
SQUARE_WEIGHTS[SEMI_STABLE] = [   0,  200,  200,  200,  200,  200,  200,    0]
SQUARE_WEIGHTS[STABLE] =      [ 700, 1200, 1000, 1000, 1000, 1000, 1200,  700]

def score(row):
    scores = [0, 0, 0]

    for c in range(8):
        scores[row.pieces[c]] += SQUARE_WEIGHTS[row.stability[c]][c]

    return 100 * (scores[BLACK] - scores[WHITE]) / (scores[BLACK] + scores[WHITE] + 1000)


out = sorted(memo, key=lambda x: score(x))


with open("./gen/edgeStability.ts", "w") as f:
    f.write("export const EDGE_SCORES: Array<f32> = [\n")
    for i in range(81):
        scores = [f"{score(memo[j]):6.2f}" for j in range(i * 81, (i+1) * 81)]
        f.write(f"    {', '.join(scores)},\n")
    f.write("]\n")

with open("./gen/edgeStabilityRaw.txt", "w") as f:
    for r in out:
        f.write(f"{score(r):5.2f},{r}\n")