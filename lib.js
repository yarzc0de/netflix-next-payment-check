const puppeteer = require("puppeteer");

class Library {
    constructor() {
        this.browserConfig = {"headless" : true}
        this.optionsConfig = {waitUntil: 'networkidle2'}
    }
    async initiateBrowser() {
        this.browser = await puppeteer.launch(this.browserConfig)
        this.page    = await this.browser.newPage();
        return true;
    }
    async gotoPage() {
        await this.page.goto("https://www.netflix.com/id-en/login", this.optionsConfig)
    }
    async fillPage(email, password) {
        await this.page.type("#id_userLoginId", email)
        await this.page.type("#id_password", password)
        await this.page.click("#appMountPoint > div > div.login-body > div > div > div.hybrid-login-form-main > form > button")
        await this.page.waitFor(8000);
        try {
            let errorLogin = await this.page.$eval("#appMountPoint > div > div.login-body > div > div > div.hybrid-login-form-main > div > div.ui-message-contents", (res) => {
                return res.innerText;
            })
            return {"error": true, "message": errorLogin};
        } catch(error) {
            try {
                let isLoggedIn = await this.page.$eval("#appMountPoint > div > div > div:nth-child(1) > div.bd.dark-background > div.profiles-gate-container > div > span > a", (res) => {
                    return res.innerText;
                })
                if(isLoggedIn.includes("PROFILES") == true) {
                    return {error: false, "message": "Login Success"};
                } else {
                    return {error: true, "message": "IDK Error something went wrong #1"}
                }
            } catch(error) {
                try {
                    let needNewMethod = await this.page.$eval("#appMountPoint > div > div > div.simpleContainer > div > div.planContainer > div.stepHeader-container > div > h1", (res) => {
                        return res.innerText;
                    });
                    if(needNewMethod.includes("Selamat datang kembali") == true || needNewMethod.includes("Welcome back") == true) {
                        return {error: true, "message": "Need New Payment Method!"}
                    } else {
                        return {error: true, "message": "IDK Error Something went wrong #2"};
                    }
                } catch(error) {
                    return {error: true, "message": "IDK Error Something went wrong #3"};
                }
            }
        }
    }
    async toPaymentPage(email, password) {
        await this.page.goto("https://www.netflix.com/YourAccount", this.optionsConfig)
        try {
            let nextPayment = await this.page.$eval("#appMountPoint > div > div > div.bd > div > div > div.responsive-account-content > div.account-section.collapsable-panel.clearfix.membership-section-wrapper.membership-section-with-button > section > div:nth-child(2) > div > div > div.account-section-group.-wide > div > div.account-section-item", (last) => {
                return last.innerText;
            })
            return {error: false, "message": "Successfully", "nextPayment": nextPayment, "email": email, "password": password}
        } catch(error) {
            return {error: true, "message": "Failed to Get Last Payment"};
        }
    }
    async killBrowser() {
        await this.browser.close();
    }
}

module.exports = Library;
