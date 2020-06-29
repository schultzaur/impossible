BOARD_SIZE = 8
ROW_COMBINATIONS = 3 ** BOARD_SIZE
EMPTY = 0
BLACK = 1
WHITE = 2
UNSTABLE = 0
SEMI_STABLE = 1
STABLE = 2

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
def get_row(pieces):
    key = pieces_to_i(pieces)

    if memo[key] is None:
        memo[key] = Row(pieces)

    return memo[key]

class Row(object):
    def __init__(self, pieces):
        # [0,1,2,2,1,2,1,1,0]
        self.pieces = pieces
        self.key = pieces_to_i(pieces)
        self.stability = [0] * 8
        self.set_stability()

    def __str__(self):
        return f"{self.pieces}|{self.key}|{self.stability}"

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

print(str(get_row([EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY])))
print(str(get_row([EMPTY, EMPTY, BLACK, WHITE, BLACK, BLACK, WHITE, EMPTY])))

#[0, 0, 0, 0, 0, 0, 0, 0]|0|[0, 0, 0, 0, 0, 0, 0, 0]
#[0, 0, 1, 2, 1, 1, 2, 0]|447|[0, 0, 0, 1, 2, 2, 0, 0] yay
