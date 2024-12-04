async function flagcollisions(inputs, cell, btnToDisable) {
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
        document.getElementById(btnToDisable).classList.remove("btn-primary")
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
        document.getElementById(btnToDisable).classList.add("btn-primary")
        document.getElementById(btnToDisable).removeAttribute("disabled","")
    }
}

function initFlag(formRoute, btnToDisable){

    const inputs = document.querySelectorAll(`form[action="${formRoute}"] input`);
    console.log('Number of inputs found:', inputs.length);

    // Execute once when the DOM is loaded (in case client enabled a disabled button and submits invalid sudoku, then goes back. the saved sudoku should still flag invalid)
    for (const input of inputs) {
        flagcollisions(inputs, input, btnToDisable);
    }

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
            if (input.classList.contains("blue-box")) {
                input.classList.remove("blue-box");
            } else {
                input.classList.add("blue-box");
            }
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
                if (row > 0) row--; // Move up
            } else if (event.key === 's' || event.key === 'S') {
                if (row < 8) row++; // Move down
            } else if (event.key === 'a' || event.key === 'A') {
                if (col > 0) col--; // Move left
            } else if (event.key === 'd' || event.key === 'D') {
                if (col < 8) col++; // Move right
            }
            
            // Move focus to the new position
            moveCursor(row, col);
        }
    });
    
    //first focus on top left
    moveCursor(0, 0);
}
