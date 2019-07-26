const Axios = require('axios');
const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const fs = require("fs");
const readlineSync = require('readline-sync');

const domain = 'https://nhentai.net';
// const sessionid = '6du7vewl8rz0xnyzvg9pdstxe43wmyk9';
// const pages = 2;

const sessionid = readlineSync.question('Enter session id: ');
const pages = readlineSync.question('Total number of pages: ');
let count = 0;

function getPage(url, handle) {
    Axios.request({
        url: url,
        method: "get",
        headers: {
            Cookie: "sessionid=" + sessionid
        }
    }).then(handle).catch(err => {
        getPage(url, handle);
    });
}

function download(url) {
    let fileCode = url.split('/')[4];
    Axios({
        method: "get",
        url: url,
        responseType: "stream",
        headers: {
            Cookie: "sessionid=" + sessionid
        }
    }).then(function (response) {
        const des = "./torrent/" + fileCode + ".torrent";
        response.data.pipe(fs.createWriteStream(des));
        console.log('Downloaded(' + ++count + '): ' + fileCode);
    }).catch(err => {
        console.log('Retrying: ' + fileCode + ' - '+ err);
        download(url);
    });
}

for (let i = 1; i <= pages; i++) {
    getPage(domain + "/favorites/?page=" + i.toString(), res => {
        const dom = new JSDOM(res.data);
        const $ = (require('jquery'))(dom.window);
        let links = $('a.cover').toArray();
        links = links.map(x => domain + x.href + 'download');

        links.forEach(link => {
            download(link);
        })
    });
}
