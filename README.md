# Sudoku Solver
## Video Demo:  <URL HERE>
## Description:
Sudokusolver is a web app where users can input sudokus and solve them with a click of a button. Users may also play sudoku.


## Motivation:
I've always been interested in puzzles that are simple to understand but actually are profoundly deep beyond the surface, and Sudoku seems like a fun choice to implement.


## Technologies used:
#### Front end: HTML, CSS (with Bootstrap), Javascript (with jQuery)
#### Back end: Python, Flask
#### Hosting: Github, Vercel


## Directory of program
```
api/
├── static/
│   ├── puzzles/
│   │   ├── hardest1905_steps.txt
│   │   ├── puzzles1_unbiased
│   │   ├── puzzles5_forum_hardest_1905_11+
│   │   ├── unbiased_steps.txt
│   │   ├── unbihard1.png
│   │   ├── unbihard2.png
│   ├── 19.png
│   ├── favicon.ico
│   ├── flagcollisions.js
│   ├── flask.png
│   ├── grid.css
│   ├── htmlcssjs.png
│   ├── I_heart_validator.png
│   ├── python.png
│   ├── rightclick.png
│   ├── styles.css
│   ├── updown.png
│   └── wasd.png
├── templates/
│   ├── index.html
│   ├── layout.html
│   ├── notes.html
│   ├── solved.html
│   ├── solver.html
│   └── sudoku.html
├── app.py
└── solve.py
README.md
requirements.txt
vercel.json


```


## Back-end
The back-end consists of two python files, **app.py** and **solve.py**.


### app.py
This is the entry point to the program. All routes are here. When the frontend submits a request, this file processes it.


#### Routes
**/**
Renders 'index.html'.


**/solver**


Check if solvable. If not, indicate to user that it is unsolvable. If is, display solution.


When user navigates to the 'Solver' page, a 'GET' method is sent and this route renders 'solver.html'. When user submits the sudoku for solving, we first perform server-side validation to ensure a valid Sudoku (no invalid symbols besides numbers from 1-9, and no colliding numbers), and solvable. We use functions imported from [solve.py](#solve.py) to attempt to solve the user-submitted sudoku, and render the 'solved.html' template accordingly. If sudoku is unsolvable, there is a flash() to inform the user.


**/labelvalid**


This is used in [flagcollisions.js](#flagcollisions.js), and is run each time the user inputs (or deletes) a value on the sudoku grid. It takes in the grid and generates a list of collisions, where each collision is defined as either a pair of coordinates where their values are colliding (breaking the no-same-value rule in each row, column or 3x3 subgrid), or an invalid value (any symbol not within 1-9). This is then fed back into the .js file to mark every colliding or invalid value as red.


**/sudoku**


A 'GET' method is sent to this route when user goes to the 'Play Sudoku' tab. Here, this route generates a valid and solvable sudoku by the following:


1. Generate a random number of values (between 10-50) and place them randomly on the grid.
2. Check if it is solvable using solve() from solve.py. If it is not, goto step 1 to regenerate.
3. Display the grid.


When user clicks 'Check Solution' button, a 'POST' method is sent:


1. Serve-side validation is done on the submitted sudoku. If it is invalid (contains illegal characters), flash a message to the user and re-render the page.
2. Else, check if it is already solved using issolved() from solve.py. If it is, flash "Congratulations" to the user.
3. Else, check if the user even tried to input anything into the grid in the first place. If not, flash "You should give it a shot!"
4. Else, check if the user's attempt is on the way to a solution by calling solve() on the user's submitted attempt. If yes, flash "Almost there! You got it partially right"
5. Else, the user did attempt the sudoku but is not on the way to a solution.
6. Finally, we call solve() to solve the sudoku and present the solution by rendering "solved.html".


**/import**


This handles the user's input in the "Import" field, and accepts a sudoku in the 81-digit string format.
This route fills the grid in row by row, taking its values from the string, and re-renders the page.


**/export**


The opposite of /import, the currently displayed grid is returned as an 81-digit string. Copying it to the clipboard is handled by initexportbtn() in [flagcollisions.js](#flagcollisions.js).


**/notes**


Renders "notes.html".


### solve.py


This file contains the logic for solving a puzzle, and is imported into app.py.
These functions are called from app.py when needed.


#### Functions


**solve(grid)**


Solves the grid in-place, and returns True if solvable, else False.



**isvalid(val, inrow, incol, arr)**


Accepts a value, row, column, and a grid, and returns True if val can be inserted into the grid at the provided row and column, else False.


**issolved(arr)**


Used in /sudoku, with input guaranteed to have no collisions.  So just check if all cells are filled, returns True if so.


## Front-end


The front-end consists of all the .html files in /templates, and the .css files and flagcollisions.js in /static.


### /templates


**layout.html**


A layout for the other .html files to extend upon. This imports Bootstrap, my .css stylesheets, and flagcollisions.js. It also includes the navbar and a custom footer for each page.


**index.html**


This is a welcome page.


**solver.html**


An empty grid for users to input sudoku to solve. The grid is implemented as a html form.


The "Submit" button submits the form to the '/solver' route, so the route will receive a 'POST' request.


The "Clear All" button just links to the '/solver' route, so the route will receive a 'GET' request, which will simply re-render the page.


The "Export" button links to the '/export' route.


**sudoku.html**


A sudoku is provided for the user to try out.


**solved.html**


A page where the solution to the submitted sudoku is displayed, often along with the relevant flash message from app.py.


**notes.html**


Some of my personal notes where I log updates and changes, and some reflections while I was making this.


### Styles


**styles.css**


Some custom styles applied to the web page.


**grid.css**


Custom styles applied to the grid itself.


### flagcollisions.js


This .js file handles a collection of events that are meant to happen in real time as the user is inputting values into the grid.


**flagcollisions(inputs, cell, btnToDisable)**


Once the user inputs a value, a fetch to '/labelvalid' occurs. The returned list then tells the console where to add the "error" class, i.e. turn the value red. If there is a collision, the relevant button ("Check Solution" for sudoku.html and "Solve" for solver.html) is disabled until all colliding values are removed.


**initFlag(formRoute, btnToDisable)**


This function calls flagcollisions with a layer of abstraction - depending on which .html file it is called from, the button to be disabled varies accordingly. Also, it includes functionality to disable the "New Game" and "Clear All" buttons for 2 seconds after the loading of the page. This is to prevent the case where the user presses these buttons in rapid succession, causing multiple concurrent threads to modify the session variables, resulting in unexpected behaviour. The right-click to mark the cell blue is also here.


**WASD()**


Implements WASD controls. When user goes vertically out-of-bounds, the cursor loops back from the other edge. When user goes to the right/left, the cursor goes to the next/previous row. This is intended behaviour, to facilitate fast input of numbers.


**initexportbtn()**


Implements the Export button. It fetches the 81-digit string from the route '/export' and copies it to the clipboard.


**highlight()**


Implements the highlighting of same row, column and 3x3 subgrid as the user mouses over the grid. For easy viewing of possible collisions.


## Puzzles


Here are the datasets which I used to test my solver on. By doing this, I was able to generate data such as how long my solver took for different difficulty of puzzles. The results are detailed in notes.html.


**puzzles1_unbiased**


A dataset (size = 42417) sampled with uniform probability from the set of all minimal Sudoku puzzles. This dataset can be said to be more representative of the average Sudoku puzzle.


**puzzles5_forum_hardest_1905_11+**


A list (size = 2980) of extremely hard puzzles maintained by members of the Enjoy Sudoku Players Forum, having a Sudoku Explainer difficulty rating above 11.0. All puzzles are solvable by my solver.


**unbiased_steps.txt and hardest1905_steps.txt**


Adding a counter to solve(), I was able to obtain number of recursive steps for each puzzle.


**06dec24 sudokusolvertest.ipynb**


Jupyter notebook used to generate boxplots.


### Deployment


**requirements.txt**


List of all my dependencies. This allows for environments to automatically install the required packages.


**vercel.json**


To define the entry point api/app.py for Vercel deployment.




