const robot = require('robotjs')
const ElTetris = require('./eltetris.js');
const Browser = require('./browser.js')

const PIECES = ['I', 'T', 'O', 'J', 'L', 'S', 'Z']
const KEYBOARD_SLEEP = 10;

// I: 3bb488
// T: 9f4396
// O: b59f3d
// J: 52439f
// L: e69362
// S: 81ad37
// Z: af383e

// TODO: convert getBoard() into eltetris board

const PIECE_COLOURS = [
    '3bb488',
    '9f4396',
    'b59f3d',
    '52439f',
    'e69362',
    '81ad37',
    'af383e'
]
// where each orientation will be placed
const ORIENTATION_COLUMNS = {
    I: [4, 6],
    T: [4, 5, 4, 4],
    O: [5],
    L: [4, 5, 4, 4],
    S: [4, 5],
    J: [4, 5, 4, 4],
    Z: [4, 5]
};

class Bot {
    constructor() {
        robot.setKeyboardDelay(0);
        this.currentColumn = 4;
        this.currentPiece = 0;
        this.eltetris = new ElTetris(10, 20);
        this.browser = new Browser();
    }
    async init() {
        var browserPage = await this.browser.startBrowser();
        this.page = browserPage;
        // console.log(browserPage, browser)
        // await sleep(2000)
        
        // await browserPage.move(964, 690, {steps: 1})
        await this.browser.awaitLoginPrompt();
        robot.moveMouse(964, 690)
        robot.mouseClick("left")
        // browserPage.click()
        await sleep(1000)

        await this.checkCaptcha()
        await sleep(6000)
        robot.moveMouse(174, 633);

        await this.type(['tab', 'tab', 'tab', 'enter'], 50);

        // goto config
        await this.type(['d', 's', 's', 's', 'enter'], 100);

        // goto gameplay setting
        await this.type(['s', 's', 's', 's', 'enter'], 100);
        // goto board shake
        await this.type(['s', 's', 's', 's'], 100)
        
        await this.pressA();
        // robot.keyToggle('a', 'down');
        // await sleep(5000);
        // robot.keyToggle('a', 'up');

        // await type(['s'], 100);
        // robot.keyToggle('a', 'down')
        // await sleep(5000);

        await this.type(['escape'], 10);

        await sleep(300)
        await this.type(['s', 'enter'], 100);
        await sleep(300)
        await this.type(['s', 's', 'enter'], 100);
        await sleep (300)
        await this.type(['enter'], 0);

        await sleep(2000)
        this.getNextPiece(); 
        // console.log(browserPage)

        await sleep(7000)
        // setInterval(() => {getBoard()}, 10000)
        // setInterval(() => { console.log(getNextPiece())}, 500)
        while (true) {
            await this.play()
        }
        // robot.getPixelColor()
    }

    async play() {
        // debugger
        const {
            orientationIndex,
            orientation,
            column
        } = this.eltetris.pickMove(this.currentPiece);
    
        this.eltetris.playMove(this.eltetris.board, orientation, column);
    
        // ElTetris.drawBoard(eltetris.board);
    
        // console.log(eltetris.board)
        
        await this.changeToOrientation(+orientationIndex);
        await this.moveToColumn(column);
        this.getNextPiece();
        await this.dropPiece();
        await sleep(30)
        await this.getBoard();
        await sleep(20)
    }

    getNextPiece() {
        var color = robot.getPixelColor(1209, 325)
        // console.log(color)
        var piece = findColor(color, PIECE_COLOURS)
        // console.log(color, PIECES[piece])
        this.currentPiece = piece;
    }

    async checkCaptcha() {
        // console.log(page)
        // if (page.url != 'https://tetr.io') {process.exit(1)}
        await this.page.waitForSelector('#captcha_form', {hidden: true, timeout: 50000})
    }

    async type(arr, wait) {
        for (var i = 0; i < arr.length; i++) {
            robot.keyTap(arr[i]);
            await sleep(wait);
        }
    }
    
    async pressA() {
        for (var i = 0; i < 100; i++) {
            // robot.keyTap('a');
            await this.page.keyboard.press('a')
        }
    }

    // warning: not slow!!!
    // used robot.screen.capture() for not slow!!!
    async getBoard() {
        var pixels = robot.screen.capture(809, 245, 300, 605);
        var coords = math();

        var res = []
        for (var y = 0; y < coords.length; y++) {
            var arr = []
            for (var x = 0; x < coords[y].length; x++) {
                // console.log(coords[y][x][0], coords[y][x][1])
                var color = pixels.colorAt(coords[y][x][0], coords[y][x][1])
                arr.push(parseColor(color))
            }
            res.push(arr)
        }
        // var logArr = []
        // for (var i = 0; i < res.length; i++) {
        //     logArr.push(res[i].join('').replaceAll(' ', '-'))
        // }
        // console.log(this.eltetris.board)
        // // console.log(board)
        // console.log(this.toEltetrisBoard(res))
        // console.log(logArr.join('\n'));
        this.eltetris.board = this.prune(this.toEltetrisBoard(res));
        // return this.toEltetrisBoard(res)

    }

    toEltetrisBoard(board) {
        var res = [];
        for (var y = board.length - 1; y > -1; y--) {
            var binary = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            for (var x = 0; x < board[y].length; x++) {
                if (board[y][x] == 'x') {binary[x] = 1}
            }
            res.push(parseInt(parseInt(binary.reverse().join('')), 2))
        }
        return res
    }

    // cleaning board, check if pieces are "free floating"
    // todo: improve !!!
    prune(board) {
        for (var i = 0; i < board.length; i++) {
            if (board[i] != 0 && i != 0) {
                if (board [i - 1] == 0) {
                    board[i] == 0;
                }
            }
        }
        return board
    }

    async moveToColumn(column) {
        //console.log('our column', this.currentColumn);
        //console.log('goal column', column);
    
        const deltaColumns = column - this.currentColumn + 1;
     
        if (deltaColumns < 0) {
             for (let i = 0; i < Math.abs(deltaColumns); i += 1) {
                await this.moveLeft();
            }
        } else if (deltaColumns > 0) {
            for (let i = 0; i < Math.abs(deltaColumns); i += 1) {
                await this.moveRight();
            }
        }
    }
    
    async moveLeft() {
        // console.log('left');
        // robot.keyTap('left');
        await this.page.keyboard.press('ArrowLeft');
        await sleep(KEYBOARD_SLEEP)
    }
    
    async moveRight() {
        // console.log('right');
        // robot.keyTap('right');
        await this.page.keyboard.press('ArrowRight');
        await sleep(KEYBOARD_SLEEP)
    }
    
    async dropPiece() {
        // console.log('drop');
        // robot.keyTap('space');
        await this.page.keyboard.press('Space');
        await sleep(KEYBOARD_SLEEP)
    }
    
    async changeToOrientation(orientation) {
        // console.log('change to orientation', orientation);
    
        for (let i = 0; i < orientation; i += 1) {
            // robot.keyTap('up');
            await this.page.keyboard.press('ArrowUp');
            await sleep(KEYBOARD_SLEEP)
        } 
    
        this.currentColumn =
            ORIENTATION_COLUMNS[PIECES[this.currentPiece]][orientation];
    }
}
module.exports = Bot;

function math() {
    // tetrio top left board pos:
    // X: 809     Y: 245
    // L: 605     W: 300
    // 10 x 20
    // zen only!!!

    // using methé (NOT breaking bad), we can calculate where every square should be,
    // and using offsets we can get exact middle
    // todo: use opencv to get pos real-time???
     
    var coordinates = []

    for (var y = 0; y < 20; y++) {
        var arr = []
        var ypos = Math.round(((y / 20) * 605))
        ypos += 15;
        
        for (var x = 0; x < 10; x++) {
            var xpos = Math.round(((x / 10) * 300))
            xpos += 15

            arr.push([xpos, ypos])
        }
        coordinates.push(arr)
    }
    // console.log(JSON.stringify(coordinates))

    return coordinates
}

function parseColor(hex) {
    var colors = ['111111', 'b151a7', 'ba6d3e', 'b9a13c', '7969c6', '3db388', 'bb3e44', '82ac3b'] //'36a57d', 'a58f37', 'a6383e', '4f4094', '93418a']

    
    var rgb = hexToRGB(hex);

    var closest = 999
    var res = ''
    for (var i = 0; i < colors.length; i++) {
        // bad comparer. dont use
        // var d =   ((colors[i][0]-rgb[0])*0.30)^2
        //         + ((colors[i][1]-rgb[1])*0.59)^2
        //         + ((colors[i][2]-rgb[2])*0.11)^2
        // console.log(`${colors[i]}: ${d}`)

        var delta = deltaE(hexToRGB(colors[i]), rgb)

        if (delta < closest && !(delta < 0)) { 
            closest = delta
            res = colors[i]
        }
    }
    
// console.log(closest)
// console.log(res)
    if (res == '111111') {
        // console.log(hexToRGB(hex))
        return ' '
    } else return 'x'
}

function findColor(rgb, colors) {
    var closest = 999
    var res = 0
    for (var i = 0; i < colors.length; i++) {
        // bad comparer. dont use
        // var d =   ((colors[i][0]-rgb[0])*0.30)^2
        //         + ((colors[i][1]-rgb[1])*0.59)^2
        //         + ((colors[i][2]-rgb[2])*0.11)^2
        // console.log(`${colors[i]}: ${d}`)

        var delta = deltaE(hexToRGB(colors[i]), hexToRGB(rgb))

        if (delta < closest && !(delta < 0)) { 
            closest = delta
            res = i
        }
    }
    return res
}

function hexToRGB(c){
    if(c.length== 4){
        c= [c[1], c[1], c[2], c[2], c[3], c[3]].join('');
    }
    c= '0x'+c.substring(1);
    return [(c>>16)&255, (c>>8)&255, c&255];
}

function deltaE(rgbA, rgbB) {
    let labA = rgb2lab(rgbA);
    let labB = rgb2lab(rgbB);
    let deltaL = labA[0] - labB[0];
    let deltaA = labA[1] - labB[1];
    let deltaB = labA[2] - labB[2];
    let c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
    let c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
    let deltaC = c1 - c2;
    let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
    deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
    let sc = 1.0 + 0.045 * c1;
    let sh = 1.0 + 0.015 * c1;
    let deltaLKlsl = deltaL / (1.0);
    let deltaCkcsc = deltaC / (sc);
    let deltaHkhsh = deltaH / (sh);
    let i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
    return i < 0 ? 0 : Math.sqrt(i);
}
  
function rgb2lab(rgb){
    let r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, x, y, z;
    r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
    z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
    x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
    y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
    z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
    return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}

const sleep = async (ms) => {return new Promise((r) => {setTimeout(() => {r()}, ms)})}