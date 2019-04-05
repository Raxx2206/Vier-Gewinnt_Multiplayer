var currentPlayer = "red";
var currentPlayerColor = "circleRed";
var otherPlayerColor = "circleBlue";
var availableRow = 0;
var movecount = 0;

// Initialisierung des Spielfeld-Arrays
var playFieldArray = new Array(7);
playFieldArray[0] = new Array(6);
playFieldArray[1] = new Array(6);
playFieldArray[2] = new Array(6);
playFieldArray[3] = new Array(6);
playFieldArray[4] = new Array(6);
playFieldArray[5] = new Array(6);
playFieldArray[6] = new Array(6);

initPlayField();

var wait = false; // if ture wait till other player moved
var socket = io(); // connect to socket
socket.on('player moved', function (msg) {
    putChip(msg);
});

socket.on('connected', function (msg) {
    wait = msg !== 0;
    if(wait) { switchPlayer(); }
});

function clicked(column) {
    if(wait) { return; } // TODO alert or so!
    putChip(column);

    wait = true; // wait till other player moved
    socket.emit('player moved', column);
}

// Funktion, die aufgerufen wird, wenn eine Spalte angeklickt wird
function putChip(column) {
    var selectedCircle;
    // Herausfinden des obersten freien Feldes in der angeklickten Spalte; -1, wenn voll
    availableRow = checkAvailableRow(column);
    // Fehlermeldung, wenn Spalte bereits voll ist
    if (availableRow === -1) {
        alert("Fehler! Spalte voll!");
        return;
    }
    // Inkrementieren der Variablen, da checkAvailableRow() die Nummer der Zeile zurückgibt, hier aber der Arrayindex benötigt wird
    availableRow++;

    switch (column) {
        case 0:
            // Handle auf oberstes freies Div in der angeklickten Spalte besorgen
            selectedCircle = $("div#column1 > div:nth-child(" + availableRow + ")");
            // Oberstes freies Feld in der angeklickten Spalte belegen
            occupyTopmostRow(0);
            break;

        case 1:
            selectedCircle = $("div#column2 > div:nth-child(" + availableRow + ")");
            occupyTopmostRow(1);
            break;

        case 2:
            selectedCircle = $("div#column3 > div:nth-child(" + availableRow + ")");
            occupyTopmostRow(2);
            break;

        case 3:
            selectedCircle = $("div#column4 > div:nth-child(" + availableRow + ")");
            occupyTopmostRow(3);
            break;

        case 4:
            selectedCircle = $("div#column5 > div:nth-child(" + availableRow + ")");
            occupyTopmostRow(4);
            break;

        case 5:
            selectedCircle = $("div#column6 > div:nth-child(" + availableRow + ")");
            occupyTopmostRow(5);
            break;

        case 6:
            selectedCircle = $("div#column7 > div:nth-child(" + availableRow + ")");
            occupyTopmostRow(6);
            break;
    }
    selectedCircle.addClass(currentPlayerColor);
    // Feld in Spielerfarbe einfärben (siehe CSS)

    // Erhöhen des Zugzählers
    // Testen ob der aktuelle Spieler gewonnen hat oder das Spielfeld voll ist
    if (checkIfWon()) {
        $("div.indicatorContainer").hide();
        alert((currentPlayer === "red" ? "Rot" : "Blau") + " gewinnt!");
        $("div#restart").show();
        var divs = $("div#playfield div.column");
        divs.prop("onclick", null);
        return;
        // Meldung, wenn Spieler gewonnen hat
    }
    if (movecount === 41) {
        $("div.indicatorContainer").hide();
        alert("Unentschieden!");
        $("div#restart").show();
        var divs = $("div#playfield div.column");
        divs.prop("onclick", null);
        return;
        // Meldung, wenn Spiel unentschieden
    }
    // Wechsel zum anderen Spieler
    switchPlayer();
    movecount++;
    wait = false;
}

function switchPlayer() {
    switch (currentPlayer) {
        case "red":
            currentPlayer = "blue";
            currentPlayerColor = "circleBlue";
            otherPlayerColor = "circleRed";
            $("div.indicatorContainerLeft").show();
            $("div.indicatorContainerRight").hide();
            break;
        case "blue":
            currentPlayer = "red";
            currentPlayerColor = "circleRed";
            otherPlayerColor = "circleBlue";
            $("div.indicatorContainerLeft").hide();
            $("div.indicatorContainerRight").show();
            break;
    }
}
// Funktion zur Bestimmung des obersten freien Feldes einer Spalte
function checkAvailableRow(column) {
    for (var i = 5; i >= 0; i--) {
        if (playFieldArray[column][i] === "white") {
            return i;
        }
    }
    return -1;
}
// Funktion zum Belegen des obersten freien Feldes einer Spalte mit der Farbe des aktuellen Spielers
function occupyTopmostRow(column) {
    playFieldArray[column][checkAvailableRow(column)] = currentPlayer;

}

// Funktion zur Bestimmung, ob der aktuelle Spieler gewonnen hat
function checkIfWon() {
    // Horizontal
    var tempArrayHorizontal = new Array(7);
    for (var row = 0; row <= 5; row++) {                            // Über Zeilen des Feldes iterieren
        for (var col = 0; col <= 6; col++) {
            tempArrayHorizontal[col] = playFieldArray[col][row];    // Aus jeder Spalte ein Feld hinzufügen
        }
        if (checkForFour(tempArrayHorizontal)) {                    // Neues Array an 4Check-Funktion übergeben
            return true;
        }
    }

    // Vertikal
    for (var col = 0; col <= 6; col++) {
        if (checkForFour(playFieldArray[col])) {
            return true;
        }
    }

    // Diagonal /
    // Array shiften
    var tempArrayDiagonal1 = playFieldArray.clone();
    for (var i = 0; i <= 6; i++) {
        for (var n = i; n > 0; n--) {
            tempArrayDiagonal1[i].unshift("white");
        }
    }

    // Suche in den Zeilen des neuen Arrays
    var tempArrayDiagonal11 = new Array(7);
    for (var row = 0; row <= 11; row++) {
        for (var col = 0; col <= 6; col++) {
            tempArrayDiagonal11[col] = tempArrayDiagonal1[col][row];
        }
        if (checkForFour(tempArrayDiagonal11)) {
            return true;
        }
    }

    // Diagonal \
    // Array shiften
    var tempArrayDiagonal2 = playFieldArray.clone();
    for (var i = 5; i >= 0; i--) {
        for (var n = i; n < 6; n++) {
            tempArrayDiagonal2[i].unshift("white");
        }
    }

    // Suche in den Zeilen des neuen Arrays
    var tempArrayDiagonal22 = new Array(7);
    for (var row = 0; row <= 11; row++) {
        for (var col = 0; col <= 6; col++) {
            tempArrayDiagonal22[col] = tempArrayDiagonal2[col][row];
        }
        if (checkForFour(tempArrayDiagonal22)) {
            return true;
        }
    }
}

// Funktion zum initialisieren des Spielfeldes (Setzen aller Felder auf "white"
function initPlayField() {
    for (var i = 0; i <= 6; i++) {
        for (var j = 0; j <= 5; j++) {
            playFieldArray[i][j] = "white";
        }
    }
}

// Funktion zur Bestimmung, ob im übergebenen Array die Farbe des aktuellen Spielers viermal hintereinander vorkommt
function checkForFour(input) {
    var count = 0;

    for (var i = 0; i < input.length; i++) {
        if (input[i] === currentPlayer) {
            count++;
            if (count === 4) {
                return true;
            }
        } else {
            count = 0;
        }
    }
    return false;
}

// Methode zum rekursiven Kopieren von Objekten
Object.prototype.clone = function () {
    var newObj = (this instanceof Array) ? [] : {};
    for (i in this) {
        if (i == 'clone') continue;
        if (this[i] && typeof this[i] == "object") {
            newObj[i] = this[i].clone();
        } else newObj[i] = this[i]
    }
    return newObj;
};