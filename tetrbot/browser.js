const puppeteer = require('puppeteer-extra');
const { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } = require('puppeteer-extra')
const UserAgent = require('user-agents')
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')

puppeteer.use(
  AdblockerPlugin({
    // Optionally enable Cooperative Mode for several request interceptors
    interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY
  })
)

class Browser {
    async startBrowser() {
        const useragent = new UserAgent()
        var browserPage;

        var browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: [ // '--disable-web-security', 
            // '--disable-features=IsolateOrigins,site-per-process',
            "--user-agent=" + useragent + "",
            "--start-maximized"
            ]
        });
        this.browser = browser;
    
        await browser.pages().then(async (pages) => {
            browserPage = pages[0];
            await browserPage.goto('https://tetr.io', {waitUntil: 'networkidle0'})
        })
        this.page = browserPage;
        return browserPage
    }
  
  async awaitLoginPrompt() {
    await this.page.waitForSelector('#entry_form', {hidden: false, timeout: 50000})
  }
}

module.exports = Browser;