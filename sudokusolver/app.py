from flask import Flask, flash, redirect, render_template, request
from flask_session import Session

import solve
import numpy as np
import random

# Configure application
app = Flask(__name__)

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)


@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

@app.route("/")
def index():
    return render_template("index.html")

# Create the empty array holding the inputted values
arr = np.zeros([9, 9], dtype = int)
# Create the empty collisions list. Why not set? As a value may be colliding with multiple other values, each collision will be recorded here. The number will be red unless it is not present in the list
collisions = []
# Did user come from the solution screen? Likely they want their previous inputted data. Otherwise, refresh everything.
prefresh = True
srefresh = True
#populate sample 'grid' array with its coords, to pass into html
grid = np.zeros([9, 9], dtype = int)
for row_index in range(9):
    for col_index in range(9):
        # Calculate the coordinate and format it as a two-digit string
        coord = 10*row_index+col_index
        grid[row_index, col_index] = coord
            # first row cells are 0-8, then 10-18, so that first digit is row num and second is col num

@app.route("/solver", methods=["GET", "POST"])
def solver():
    """Check if solvable. If not, indicate to user than unsolvable. If is, display solution."""

    global arr 
    global collisions
    global srefresh
    global grid
    global puzzle
    global prefresh
    prefresh = True
    
    if request.method == "GET":

        if srefresh: #False if user came from solution page, otherwise True
            arr = np.zeros([9, 9], dtype = int)
            collisions = []
        else:
            srefresh = True #next time, it refreshes, unless user goes to solution page again



        return render_template("solver.html", grid = grid, arr=arr)

    elif request.method == "POST":
        #server-side validation
        if collisions != []:
            flash("Invalid Sudoku!")
            return render_template("solver.html", grid = grid, arr=arr)
        
        #process output
        result = arr.copy() #so that old arr is still stored in arr. arr is gotten from the global arr instead of from the form
        solve.solve(result)
        # if result == None:
        #     flash("Unsolvable!") #this flash is put inside solve.main() instead 
        # else:
        srefresh = False #keep user previously inputted values
        return render_template("solved.html", grid = grid, soln = result, original = arr, attempt = arr)


@app.route("/labelvalid")
def labelvalid():
    """similar to solve.isvalid() but returns coords of all colliding numbers to javascript caller.
    Also, if user inputs valid input, it is added to arr"""
    # don't want to add this functionality to isvalid() because it will perform useless checks that slows down the algorithm.

    # get val, inrow, incol, arr of inputted cell

    val = request.args.get("val")
    inrow = request.args.get("row")
    incol = request.args.get("col")
    inrow = int(inrow)
    incol = int(incol)

    global arr
    global collisions
 
    #removing the old numbers, pop ONE instance of colliding coord. if other numbers still colliding with others, they would still be in the list
    oldval = int(arr[inrow][incol])

    arr[inrow][incol] = 0 #remove the number first, so that now can check for other numbers that used to collide with it

    while (inrow,incol) in collisions: # user deleted past out of range or invalid input. anyway, a deleted cell cannot collide with anything
        collisions.remove((inrow,incol))

    if oldval != 0:
        #If there used to be a collision on the same col
        for row in range(0,9):
            if arr[row][incol] == oldval:
                collisions.remove((row,incol))
  


        #If there used to be a collision on the same row
        for col in range(0,9):
            if arr[inrow][col] == oldval:
                collisions.remove((inrow,col))
    


        #If there used to be a collision on the same box (3*3)
        topleftrow=(inrow//3)*3
        topleftcol=(incol//3)*3
        for row in range(topleftrow,topleftrow+3):
            for col in range(topleftcol,topleftcol+3):
                if arr[row][col] == oldval:
                    if (row,col) in collisions: #might have already been removed from row or col checks above!
                        collisions.remove((row,col))
            


    if val == "":
        val = 0

    else: #case of adding numbers
        newcollisions = []
        try: #server-side validation
            val = int(val) #if val is not int, go straight to exception

            if val == 0:
                pass #just ignore user's inputted 0

            elif (val < 1 or val > 9): # user put in out of range input
                newcollisions.append((inrow,incol)) #add (x,y) tuple to collisions and skip detecting collisions
            else:


                #If the same number already exists on the same col
                for row in range(0,9):
                    if arr[row][incol] == val:
                        newcollisions.append((row,incol))
                        newcollisions.append((inrow,incol)) #append its own coords too


                #If the same number already exists on the same row
                for col in range(0,9):
                    if arr[inrow][col] == val:
                        newcollisions.append((inrow,col))
                        newcollisions.append((inrow,incol)) #append its own coords too


                #If the same number already exists on the same box (3*3)
                topleftrow=(inrow//3)*3
                topleftcol=(incol//3)*3
                for row in range(topleftrow,topleftrow+3):
                    for col in range(topleftcol,topleftcol+3):
                        if arr[row][col] == val:
                            newcollisions.append((row,col))
                            newcollisions.append((inrow,incol)) #append its own coords too

                arr[inrow][incol] = val #after all checks, add inputted val into arr. arr only contains valid values


        except Exception as e: #val, inrow or incol are not int
            print(repr(e))
            newcollisions.append((inrow,incol))

        finally:    #add new inputted value into arr
            collisions = collisions + newcollisions
            

    return list(set(collisions))

puzzle = np.zeros([9, 9], dtype = int)
@app.route("/sudoku", methods=["GET", "POST"])
def sudoku():
    global arr 
    global collisions
    global grid
    global puzzle
    global prefresh
    global srefresh
    srefresh = True

    if request.method == "GET": 

        if prefresh: #False if user came from solution page, otherwise True
            
            if request.args.get("clear") == "True": #Clear All
                collisions = []
                return render_template("sudoku.html", grid = grid, original = puzzle, attempt = puzzle)
        
            """Generate a solvable, valid sudoku puzzle."""


            arr = np.zeros([9, 9], dtype = int)
            collisions = []


            numofnum = random.randint(10, 50)  #number of numbers to be generated

            for num in range(numofnum):
                val = random.randint(1, 9) 
                row = random.randint(0, 8) 
                col = random.randint(0, 8) 

                if arr[row][col] == 0 and solve.isvalid(val, row, col, arr): #if the cell hasn't already been filled and it is valid
                    arr[row][col] = val

            #check if its solvable
            attempt = arr.copy()
            if solve.solve(attempt):
                puzzle = arr.copy() #store the puzzle
                return render_template("sudoku.html", grid = grid, original = puzzle, attempt = arr)
            else:
                return redirect("/sudoku") #regenerate 

        else:
            prefresh = True #next time, it refreshes, unless user goes to solution page again
            return render_template("sudoku.html", grid = grid, original = puzzle, attempt = arr)




    elif request.method == "POST":
        """Checks solution."""
        #server-side validation
        if collisions != []:
            flash("Invalid Sudoku!")
            return render_template("sudoku.html", grid = grid, original = puzzle, attempt = arr)

        #process output
        submitted = arr.copy() #so that old arr is still stored in arr. arr is gotten from the global arr instead of from the form
        attempt = submitted.copy()
        if solve.issolved(submitted):
            flash("Congratulations! You got the solution")
            soln = submitted
        elif np.array_equal(submitted,puzzle): #user did not try
            flash("You should give it a shot! This is the solution")
            soln = submitted.copy()
            solve.solve(soln)
        elif solve.solve(attempt): #user is on the way to a solution. that is, a solution can be reached by solving what the user has inputted
            flash("Almost there! You got it partially right")
            soln = attempt #solve.solve(attempt) not only returns True or False, it also changes attempt to become the solution
        else: #user is not approaching a solution. reveal the solution
            flash("Try again next time! This is the solution")
            puzzle2 = puzzle.copy()
            solve.solve(puzzle2)
            soln = puzzle2

        prefresh = False
        return render_template("solved.html", grid=grid, soln = soln, original = puzzle, attempt = arr)






