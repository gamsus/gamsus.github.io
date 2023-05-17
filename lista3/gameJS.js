/*jslint browser:true */
let elements = [];
let i = 0;
let console;
function loadIMG(url) {
    return new Promise((resolve, reject) => {
        let element = document.createElement("img");
        element.onload = () => { resolve(url); };
        element.onerror = () => { reject(url); };
        element.src = url;
        elements[i] = element;
        element.addEventListener("click", () => {
            if (!element.hasAttribute("chosen")) {
                element.toggleAttribute("chosen");
                let j = 0;
                if (j < i) {
                    for (j = 0; j < i; j += 1) {
                        if (element !==
                            document.getElementById("images").children[j]) {
                            document.getElementById("images").children[j]
                                .removeAttribute("chosen");
                        }
                    }
                }
            }
        });
        i = i + 1;
    });
}

Promise.all([
    loadIMG("img1.jpg"),
    loadIMG("img2.jpg")
]).then(() => {
    let z = 0;
    if (z < i) {
        for (z = 0; z < i; z += 1) {
            document.getElementById("images")
                .appendChild(elements[z]);
        }
    }
    document.getElementById("confirm").addEventListener("click", () => {
        let j = 0;
        if (j < i) {
            for (j = 0; j < i; j += 1) {
                if (elements[j].hasAttribute("chosen")) {
                    init(document.getElementById("columns")
                        .value, document.getElementById("rows")
                        .value, elements[j].src);
                    break;
                }
            }
        }
    });

}).catch(() => {
    console.log("error while loading images");
});

elements[0].toggleAttribute("chosen");

let columns;
let rows;
let _color = "#980505";
let _canvas;
let _stage;
let _img;
let _pieces;
let _puzzleWidth;
let _puzzleHeight;
let _pieceWidth;
let _pieceHeight;
let _currentPiece;
let _currentDropPiece;
let _mouse;
let _available = [];
let j;
let k;
let setTimeout;


function init(c, r, src) {
    columns = parseInt(c);
    rows = parseInt(r);
    k = columns * rows - 1;
    _img = new Image();
    _img.addEventListener("load", onImage);
    _img.src = src;
}

function onImage() {
    _pieceWidth = Math.floor(_img.width / columns);
    _pieceHeight = Math.floor(_img.height / rows);
    _puzzleWidth = _pieceWidth * columns;
    _puzzleHeight = _pieceHeight * rows;

    setCanvas();
    initPuzzle();
}

function setCanvas() {
    _canvas = document.getElementById("canvas");
    _stage = _canvas.getContext("2d");
    _canvas.width = _puzzleWidth;
    _canvas.height = _puzzleHeight;
    _canvas.style.border = "5px solid black";
}

function initPuzzle() {
    _pieces = [];
    _mouse = { x: 0, y: 0 };
    _currentPiece = null;
    _currentDropPiece = null;
    _stage.drawImage(_img, 0, 0, _puzzleWidth, _puzzleHeight,
        0, 0, _puzzleWidth, _puzzleHeight);
    buildPieces();
}

function buildPieces() {
    let piece;
    let xPos = 0;
    let yPos = 0;
    let z;
    for (z = 0; z < columns * rows; z += 1) {
        piece = {};
        piece.sx = xPos;
        piece.sy = yPos;
        _pieces.push(piece);
        xPos += _pieceWidth;
        if (xPos >= _puzzleWidth) {
            xPos = 0;
            yPos += _pieceHeight;
        }
    }
    shufflePuzzle();
}

function shufflePuzzle() {
    shuffleArray(_pieces);
    _stage.clearRect(0, 0, _puzzleWidth, _puzzleHeight);
    let piece;
    let xPos = 0;
    let yPos = 0;
    let z;
    for (z = 0; z < _pieces.length; z += 1) {
        piece = _pieces[z];
        piece.xPos = xPos;
        piece.yPos = yPos;
        if (z === k) {
            _stage.fillStyle = _color;
            _stage.fillRect(piece.xPos, piece.yPos, _pieceWidth, _pieceHeight);
        } else {
            _stage.drawImage(_img, piece.sx, piece.sy,
                _pieceWidth, _pieceHeight, piece.xPos,
                piece.yPos, _pieceWidth, _pieceHeight);
        }
        _stage.strokeRect(xPos, yPos, _pieceWidth, _pieceHeight);
        xPos += _pieceWidth;
        if (xPos >= _puzzleWidth) {
            xPos = 0;
            yPos += _pieceHeight;
        }
    }

    document.onpointerdown = onPuzzleClick;
}

function shuffleArray(array) {
    let r = columns * columns * rows * rows * 10;
    for (i = 0; i < r; i += 1) {
        let a = parseInt(Math.random() * 4);
        let b;
        switch (a) {
            case 0:
                if (k - columns >= 0) { b = k - columns; }
                else if (k + columns < columns * rows) { b = k + columns; }
                else if ((k % columns) !== 0) { b = k - 1; }
                else if ((k - columns + 1) % columns !== 0) { b = k + 1; }
                break;
            case 1:
                if (k + columns < columns * rows) { b = k + columns; }
                else if ((k % columns) !== 0) { b = k - 1; }
                else if ((k - columns + 1) % columns !== 0) { b = k + 1; }
                else if (k - columns >= 0) { b = k - columns; }
                break;
            case 2:
                if ((k % columns) !== 0) { b = k - 1; }
                else if ((k - columns + 1) % columns !== 0) { b = k + 1; }
                else if (k - columns >= 0) { b = k - columns; }
                else if (k + columns < columns * rows) { b = k + columns; }
                break;
            case 3:
                if ((k - columns + 1) % columns !== 0) { b = k + 1; }
                else if (k - columns >= 0) { b = k - columns; }
                else if (k + columns < columns * rows) { b = k + columns; }
                else if ((k % columns) !== 0) { b = k - 1; }
                break;
        }

        swap(array, k, b);
        k = b;
    }

    while (k > 0) {
        swap(array, k, k - 1);
        k = k - 1;
    }
}

function swap(array, a, b) {
    let temp = array[a];
    array[a] = array[b];
    array[b] = temp;
}

function onPuzzleClick(e) {
    _mouse.x = (e.clientX - _canvas.getBoundingClientRect().left)
        * _canvas.width / _canvas.getBoundingClientRect().width;
    _mouse.y = (e.clientY - _canvas.getBoundingClientRect().top)
        * _canvas.height / _canvas.getBoundingClientRect().height;

    _currentPiece = checkPieceClicked();

    if (_currentPiece !== null) {
        document.onpointerdown = pieceDrop;
    }
}

function checkPieceClicked() {
    let piece;
    for (i = 0; i < _pieces.length; i += 1) {
        piece = _pieces[i];
        if (piece === _pieces[k] &&
            _mouse.x > piece.xPos && _mouse.x < (piece.xPos + _pieceWidth) &&
            _mouse.y > piece.yPos && _mouse.y < (piece.yPos + _pieceHeight)) {
            if (i - columns >= 0) { _available[0] = _pieces[i - columns]; }
            if (i + columns < columns * rows) {
                _available[1] = _pieces[i + columns];
            }
            if ((i % columns) !== 0) {
                _available[2] = _pieces[i - 1];
            }
            if ((i - columns + 1) % columns !== 0) {
                _available[3] = _pieces[i + 1];
            }
            for (j = 0; j < _available.length; j += 1) {
                if (null != _available[j]) { //warning
                    _stage.globalAlpha = 0.4;
                    _stage.fillStyle = _color;
                    _stage.fillRect(_available[j].xPos, _available[j]
                        .yPos, _pieceWidth, _pieceHeight);
                    _stage.restore();
                    _stage.globalAlpha = 1;
                }
            }
            return piece;
        }
    }
    return null;
}

function pieceDrop(e) {

    _mouse.x = (e.clientX - _canvas.getBoundingClientRect().left)
        * _canvas.width / _canvas.getBoundingClientRect().width;
    _mouse.y = (e.clientY - _canvas.getBoundingClientRect().top)
        * _canvas.height / _canvas.getBoundingClientRect().height;
    document.onpointerup = null;
    _currentDropPiece = checkPieceDropped();
    if (_currentDropPiece != null && checkAvailability(_currentDropPiece)){//bl
        let tmp = { xPos: _currentPiece.xPos, yPos: _currentPiece.yPos };
        _currentPiece.xPos = _currentDropPiece.xPos;
        _currentPiece.yPos = _currentDropPiece.yPos;
        _currentDropPiece.xPos = tmp.xPos;
        _currentDropPiece.yPos = tmp.yPos;
        for (j = 0; j < _pieces.length; j += 1) {
            if (_currentPiece === _pieces[j]) { break; }
        }
        for (k = 0; k < _pieces.length; k += 1) {
            if (_currentDropPiece === _pieces[k]) { break; }
        }
        swap(_pieces, k, j);
    }
    for (i = 0; i < _available.length; i += 1) {
        _available[i] = null;
    }
    resetPuzzleAndCheckWin();
    document.onpointerdown = onPuzzleClick;
}

function checkPieceDropped() {
    let piece;
    for (i = 0; i < _pieces.length; i += 1) {
        piece = _pieces[i];
        if (_mouse.x > piece.xPos && _mouse.x < (piece.xPos + _pieceWidth) &&
            _mouse.y > piece.yPos && _mouse.y < (piece.yPos + _pieceHeight)) {
            return piece;
        }
    }
    return null;
}


function checkAvailability(piece) {
    for (i = 0; i < _available.length; i += 1) {
        if (piece === _available[i]) { return true; }
    }
    return false;
}

function resetPuzzleAndCheckWin() {
    _stage.clearRect(0, 0, _puzzleWidth, _puzzleHeight);
    let gameWin = true;
    let piece;
    for (i = 0; i < _pieces.length; i += 1) {
        piece = _pieces[i];
        if (piece === _pieces[k]) {
            _stage.fillStyle = _color;
            _stage.fillRect(piece.xPos, piece.yPos, _pieceWidth, _pieceHeight);
        } else {
            _stage.drawImage(_img, piece.sx, piece.sy,
                _pieceWidth, _pieceHeight, piece.xPos,
                piece.yPos, _pieceWidth, _pieceHeight);
        }
        _stage.strokeRect(piece.xPos, piece.yPos, _pieceWidth, _pieceHeight);
        if (!(piece.xPos === piece.sx && piece.yPos === piece.sy)) {
            gameWin = false;
        }
    }

    if (gameWin) {
        setTimeout(gameOver, 500);
    }
}

function gameOver() {
    document.onpointerdown = null;
    document.getElementById("state").textContent = "wygrales!!!!";
}
