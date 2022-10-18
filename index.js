const puppeteer = require('puppeteer');
const UserAgent = require('user-agents')
const robot = require('robotjs')

var browser;
robot.setKeyboardDelay(0);

async function startBrowser() {
    const useragent = new UserAgent()

    browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [ // '--disable-web-security', 
        // '--disable-features=IsolateOrigins,site-per-process',
        "--user-agent=" + useragent + "",
        "--start-maximized"
        ]
    });
}

async function checkCaptcha() {

    await browser.pages().then(async (pages) => {
        var page = pages[0]
        console.log(page)
        // if (page.url != 'https://tetr.io') {process.exit(1)}
        if (page.$('#captcha_form') != null) {
            console.log("captcha'd!!!!")
            await page.waitForSelector('#captcha_form', {hidden: true, timeout: 50000})
        } else { console.log('no captcha... 😔') }
    })
}

async function type(arr, wait) {
    for (var i = 0; i < arr.length; i++) {
        robot.keyTap(arr[i]);
        await sleep(wait);
    }
}

const sleep = async (ms) => {return new Promise((r) => {setTimeout(() => {r()}, ms)})}

async function init() {
    await startBrowser();

    await type("https://tetr.io".split(""), 50)
    await sleep(100)
    robot.keyTap('enter')

    await sleep(3000)
    
    robot.moveMouse(964, 690)
    robot.mouseClick("left")
    
    await sleep (1000)

    await checkCaptcha()
    await sleep(7000)
    
    await type(['tab', 'tab', 'tab', 'enter'], 50);
    await type(['d', 's', 'enter'], 200)
    await sleep(300)
    await type(['s', 's', 'enter'], 200);
    await sleep(300)
    await type(['enter'], 0);

    // robot.getPixelColor()
}


init()

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

    // [x, y]
    // [[[824,260],[854,260],[884,260],[914,260],[944,260],[974,260],[1004,260],[1034,260],[1064,260],[1094,260]],
    // [[824,290],[854,290],[884,290],[914,290],[944,290],[974,290],[1004,290],[1034,290],[1064,290],[1094,290]],
    // [[824,321],[854,321],[884,321],[914,321],[944,321],[974,321],[1004,321],[1034,321],[1064,321],[1094,321]],
    // [[824,351],[854,351],[884,351],[914,351],[944,351],[974,351],[1004,351],[1034,351],[1064,351],[1094,351]],
    // [[824,381],[854,381],[884,381],[914,381],[944,381],[974,381],[1004,381],[1034,381],[1064,381],[1094,381]],
    // [[824,411],[854,411],[884,411],[914,411],[944,411],[974,411],[1004,411],[1034,411],[1064,411],[1094,411]],
    // [[824,442],[854,442],[884,442],[914,442],[944,442],[974,442],[1004,442],[1034,442],[1064,442],[1094,442]],
    // [[824,472],[854,472],[884,472],[914,472],[944,472],[974,472],[1004,472],[1034,472],[1064,472],[1094,472]],
    // [[824,502],[854,502],[884,502],[914,502],[944,502],[974,502],[1004,502],[1034,502],[1064,502],[1094,502]],
    // [[824,532],[854,532],[884,532],[914,532],[944,532],[974,532],[1004,532],[1034,532],[1064,532],[1094,532]],
    // [[824,563],[854,563],[884,563],[914,563],[944,563],[974,563],[1004,563],[1034,563],[1064,563],[1094,563]],
    // [[824,593],[854,593],[884,593],[914,593],[944,593],[974,593],[1004,593],[1034,593],[1064,593],[1094,593]],
    // [[824,623],[854,623],[884,623],[914,623],[944,623],[974,623],[1004,623],[1034,623],[1064,623],[1094,623]],
    // [[824,653],[854,653],[884,653],[914,653],[944,653],[974,653],[1004,653],[1034,653],[1064,653],[1094,653]],
    // [[824,684],[854,684],[884,684],[914,684],[944,684],[974,684],[1004,684],[1034,684],[1064,684],[1094,684]],
    // [[824,714],[854,714],[884,714],[914,714],[944,714],[974,714],[1004,714],[1034,714],[1064,714],[1094,714]],
    // [[824,744],[854,744],[884,744],[914,744],[944,744],[974,744],[1004,744],[1034,744],[1064,744],[1094,744]],
    // [[824,774],[854,774],[884,774],[914,774],[944,774],[974,774],[1004,774],[1034,774],[1064,774],[1094,774]],
    // [[824,805],[854,805],[884,805],[914,805],[944,805],[974,805],[1004,805],[1034,805],[1064,805],[1094,805]],
    // [[824,835],[854,835],[884,835],[914,835],[944,835],[974,835],[1004,835],[1034,835],[1064,835],[1094,835]]]

    for (var y = 0; y < 20; y++) {
        var arr = []
        var ypos = Math.round(245 + ((y / 20) * 605))
        ypos += 15;
        
        for (var x = 0; x < 10; x++) {
            var xpos = Math.round(809 + ((x / 10) * 300))
            xpos += 15

            arr.push([xpos, ypos])
        }
        coordinates.push(arr)
    }
    console.log(JSON.stringify(coordinates))
}

math()