let isRunning = false;

async function flagcollisions(inputs, cell, btnToDisable) {

    if (isRunning) return; // Prevent new calls while one is ongoing

    isRunning = true;

    // find all colliding values and colours them red
    inputs.forEach(input => { //remove all "error" classes
            
            if (input.classList.contains("error")) {
                input.classList.remove("error");
            }
        });

    //get coords of inputted cell
    const val = cell.value;

    const row = ((cell.name - cell.name % 10) / 10).toString();
    const col = (cell.name % 10).toString();

    //fetch collisions coords. also updates global arr
    let collisions = await fetch('/labelvalid?' + new URLSearchParams({ val: val, row: row, col: col }).toString()) // https://stackoverflow.com/questions/35038857/setting-query-string-using-fetch-get-request
        .then(response => response.text()) // promise chaining
        .then(text => JSON.parse(text)) // promise chaining
        .catch(error => console.error('Error fetching collision data:', error)); // handle any errors

        // console.log(collisions);

    if (collisions.length > 0) {
        

        //disable btnToDisable button
        document.getElementById(btnToDisable).classList.remove("btn-success")
        document.getElementById(btnToDisable).classList.add("btn-secondary")
        document.getElementById(btnToDisable).setAttribute("disabled","")

        //add red colouring to collisions coords
        collisions.forEach(coord => { // for coord in collisions,
        
            document.querySelector(`input[name='${10*coord[0]+coord[1]}']`).classList.add("error") // add error class

        });
    }

    else { 
        //re-enable btnToDisable button
        document.getElementById(btnToDisable).classList.remove("btn-secondary")
        document.getElementById(btnToDisable).classList.add("btn-success")
        document.getElementById(btnToDisable).removeAttribute("disabled","")

        // //remove red colouring to collisions coords
        // collisions.forEach(coord => { // for coord in collisions,

        //     document.querySelector(`input[name='${10*coord[0]+coord[1]}']`).classList.remove("error") // remove error class

        // });
    }

    isRunning = false; // Reset flag
}

function initFlag(formRoute, btnToDisable){

    const inputs = document.querySelectorAll(`form[action="${formRoute}"] input`);
    // console.log('Number of inputs found:', inputs.length);

    // Execute once when the DOM is loaded (in case client enabled a disabled button and submits invalid sudoku, then goes back. the saved sudoku should still flag invalid)
    for (const input of inputs) {
        flagcollisions(inputs, input, btnToDisable);
    }

    const newGameButton = document.querySelector('a[name="New Game"]');
    const clearAllButton = document.querySelector('a[name="Clear All"]');

    // Disable the buttons initially. This is to prevent abuse of "New Game" button, which can cause mutiple threads running at the same time, causing arr to not be updated.
    if (newGameButton) newGameButton.removeAttribute('href'); // Removes the navigation functionality
    if (clearAllButton) clearAllButton.removeAttribute('href'); // Removes the navigation functionality

    // Re-enable the buttons after 2 seconds
    setTimeout(() => {
        if (newGameButton) newGameButton.setAttribute('href', '/sudoku'); // Adds back the navigation functionality
        if (btnToDisable == "checksoln") clearAllButton.setAttribute('href', '/sudoku?clear=True'); // Adds back the navigation functionality
        if (btnToDisable == "solvebtn") clearAllButton.setAttribute('href', '/solver'); // Adds back the navigation functionality
    }, 2000);

    //execute each time there is an input
    inputs.forEach(input => {
        input.addEventListener('input', function(event) {
            if (parseInt(this.value, 10) === 0) {this.value = 9;} // if decrease from 1, loops back to 9

            this.value = this.value.replace(/[^1-9]/g, ''); // remove all other characters client-side. input type "number" also accepts symbols and e

            if (this.value.length > 1) {// maxlength attribute doesnt work for input type = "text", so use js to enforce for client-side
                this.value = this.value.slice(1, 2);
            } 

            flagcollisions(inputs, event.target, btnToDisable);

        });

        //right click = mark blue
        input.addEventListener("contextmenu", (event) => {
            event.preventDefault(); // Prevent the default right-click menu

            // Toggle the blue-box class
            input.classList.toggle("blue-box"); //Same as add if dh, and remove if have

        });    
    });

    //activate WASD input
    WASD();

}

function WASD(){
    function moveCursor(row, col) {
        const name = (row === 0) ? `${col}` : `${row}${col}`; // because name in input 0th row is just a single digit
        const input = document.querySelector(`input[name="${name}"]`);
        if (input) {
            input.focus();
        }
    }
    // Event listener for keydown to handle WASD input
    document.addEventListener('keydown', function(event) {
        const activeElement = document.activeElement;
        
        if (activeElement && activeElement.tagName.toLowerCase() === 'input') {
            // Get the current focused input's name (row and col)
            const currentName = activeElement.name;
            let row = parseInt((currentName - currentName%10)/10); // First digit is the row
            let col = parseInt(currentName%10); // Second digit is the col
            
            // Move cursor based on key press
            if (event.key === 'w' || event.key === 'W') {
                row--; // Move up
            } else if (event.key === 's' || event.key === 'S') {
                row++; // Move down
            } else if (event.key === 'a' || event.key === 'A') {
                if (col > 0){ col--; } else {row--; col = 8;} // Move left, or if at the first column, move prev row last col
            } else if (event.key === 'd' || event.key === 'D') {
                if (col < 8){ col++; } else {row++; col = 0;} // Move right, or if at the last column, move next row first col
            }
            // row >= 8 ? row = 0 : row < 0 ? row = 8: row;
            // col >= 8 ? col = 0 : col < 0 ? col = 8: col;
            row = (row + 9) % 9; // cleaner way for cyclic behaviour
            col = (col + 9) % 9;

            // Move focus to the new position
            moveCursor(row, col);
        }
    });
    
    //first focus on top left
    moveCursor(0, 0);
}

function initexportbtn(){
    document.getElementById('exportbtn').addEventListener('click', function(event) {
        event.preventDefault()
        // Fetch the text from app.py/export or /export?solved=1 (take from a href attribute to give illusion that the button directly links to the route. Abstraction.)
        const href = this.getAttribute('href'); // Access the href attribute
        fetch(`${href}`)
            .then(response => response.text())
            .then(data => {
                console.log(data);
                navigator.clipboard.writeText(data) // Copy to clipboard
                    .then(() => {
                        alert('Puzzle copied to clipboard!');
                    })
                    .catch(err => {
                        console.error('Failed to copy puzzle: ', err);
                    });
            })
            .catch(err => {
                console.error('Failed to fetch text from backend: ', err);
            });
    });
}

function highlight(){
    // Event listener for mouseover highlights
    document.addEventListener('mouseover', function(event) {
        const over = event.target;
        if (over.tagName === 'INPUT') { 
            const overname = over.name;
            let row = parseInt((overname - overname%10)/10); // First digit is the row
            let col = parseInt(overname%10); // Second digit is the col

            //Same col
            for (let r = 0; r < 9; r = r + 1){
                let name = (r === 0) ? `${col}` : `${r}${col}`; // because name in input 0th row is just a single digit
                let tobehighlighted = document.querySelector(`input[name="${name}"]`);
                tobehighlighted.classList.add('highlight2');
            }

            //Same row
            for (let c = 0; c < 9; c = c + 1){
                let name = (row === 0) ? `${c}` : `${row}${c}`; // because name in input 0th row is just a single digit
                let tobehighlighted = document.querySelector(`input[name="${name}"]`);
                tobehighlighted.classList.add('highlight2');
            }

            //Same box
            for (let r = row - 1; r < row + 2; r = r + 1){
                for (let c = col - 1; c < col + 2; c = c + 1){
                    let name = (r === 0) ? `${c}` : `${r}${c}`; // because name in input 0th row is just a single digit
                    let tobehighlighted = document.querySelector(`input[name="${name}"]`);
                    if (tobehighlighted){
                        tobehighlighted.classList.add('highlight3');
                    }
                }
            }

            over.classList.remove('highlight2', 'highlight3');
            over.classList.add('highlight1'); // Color of cell that is hovered over
        }
    });
    
    // Event listener for mouseout to reset styles
    document.addEventListener('mouseout', function (event) {
        if (event.target.tagName === 'INPUT') {
            const inputs = document.querySelectorAll('input'); // Select all inputs
            inputs.forEach(input => input.classList.remove('highlight1', 'highlight2', 'highlight3')); // Reset color to default
        }
    });

}

