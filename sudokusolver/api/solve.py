import numpy as np
import random
from flask import flash





def solve(grid):
    arr = grid

    # Check which row / column / box has the least empty squares, to fill that first
    rowblanks=[0]*9
    colblanks=[0]*9
    boxblanks=[0]*9

    for row in range(0,9): # excludes 9
        for col in range(0,9):
            if arr[row][col]==0:
                rowblanks[row]+=1
                colblanks[col]+=1
                bigsqno = (row//3)*3 + col//3
                boxblanks[bigsqno]+=1

    joinedlist = rowblanks+colblanks+boxblanks
    joinedlist = [x for x in joinedlist if x != 0] #at least 1 empty square, dont count the fully filled ones already

    # Base case of all squares filled (successfully solved)
    if joinedlist==[]:
        return True # Return to the previous call on the stack

    least = min(joinedlist) #no. of least empty squares

    if least in boxblanks:
        bigsqno=boxblanks.index(least)
        #coords for the top left box in the big box(3x3)
        topleftrow=(bigsqno//3)*3
        topleftcol=(bigsqno-topleftrow)*3
        #for every box in big box
        for row in range(topleftrow,topleftrow+3):
            for col in range(topleftcol,topleftcol+3):
                if arr[row][col] == 0:
                    for val in range(1,10): #iterate through each possible value to put in the box
                        if isvalid(val, row, col, arr):
                            arr[row][col] = val
                            if solve(arr) == False: #backtracking
                                arr[row][col] = 0 # removes prev value
                                continue # goes back to val iterating to the next value and finding the next valid value
                            else:
                                return True
                    return False #all values 1-9 has been exhausted. return to previous call on stack
                
    elif least in rowblanks:
        for col in range(0,9):
            if arr[rowblanks.index(least)][col] == 0:
                for val in range(1,10): #iterate through each possible value to put in the box
                    if isvalid(val, rowblanks.index(least), col, arr):
                        arr[rowblanks.index(least)][col] = val
                        if solve(arr) == False: #backtracking
                            arr[rowblanks.index(least)][col] = 0 # removes prev value
                            continue # goes back to val iterating to the next value and finding the next valid value
                        else:
                            return True
                return False # all values 1-9 has been exhausted. return to previous call on stack

    elif least in colblanks:
        for row in range(0,9):
            if arr[row][colblanks.index(least)] == 0:
                for val in range(1,10): #iterate through each possible value to put in the box
                    if isvalid(val, row, colblanks.index(least), arr):
                        arr[row][colblanks.index(least)] = val
                        if solve(arr) == False: #backtracking
                            arr[row][colblanks.index(least)] = 0 # removes prev value
                            continue # goes back to val iterating to the next value and finding the next valid value
                        else:
                            return True
                return False # all values 1-9 has been exhausted. return to previous call on stack





def isvalid(val, inrow, incol, arr):

    #If the same number already exists on the same row
    for row in range(0,9):
        if arr[row][incol] == val:
            return False

    #If the same number already exists on the same col
    for col in range(0,9):
        if arr[inrow][col] == val:
            return False

    #If the same number already exists on the same box (3*3)
    topleftrow=(inrow//3)*3
    topleftcol=(incol//3)*3
    for row in range(topleftrow,topleftrow+3):
        for col in range(topleftcol,topleftcol+3):
            if arr[row][col] == val:
                return False

    return True


def issolved(arr): #used in /sudoku, with input guranteed to have no collisions.  So just check if all cells filled
    for row in range(0,9):
        for col in range(0,9):
            if arr[row][col] == 0:
                return False
    return True


