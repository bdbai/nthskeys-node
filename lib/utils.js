'use strict';
const Promise = require('bluebird');
const fs = require('fs-extra');
const path = require('path');
const http = require('http');
const cheerio = require('cheerio');
const childProcess = require('child_process');

const NTHS_HOST = 'bdbai.ml';
const ARCHIVE_PATH = path.join(process.env.FILE_PATH, 'archive');
const ENTRYLIST_PATH= '/webschool/News/news_list.jsp?siteId=0&typeId=news33';
const ENTRIES_SELECTOR = 'body > table:nth-child(8) > tr:nth-child(2) > td:nth-child(2) > table:nth-child(2) > tr:nth-child(2) > td > table:nth-child(3) > tr > td > a';
const ATTACHMENT_SELECTOR = 'body > table:nth-child(9) > tr > td > table:nth-child(5) a[href*=upload]';
const REQUEST_COMMON_HEADERS = {
    'Host':       NTHS_HOST,
    'Referer':    `http://${NTHS_HOST}`,
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.82 Safari/537.36',
};
const SUBJECTS = [
    '语文',
    '数学',
    '英语',
    '物理',
    '化学',
    '历史',
    '地理',
    '政治',
    '生物',
    '杂项'
];

!function () {
    fs.ensureDirSync(ARCHIVE_PATH);
}();


let logLine = str => {
    console.log(new Date().toTimeString().substr(0, 8) + ' ' +  str);
};
let logError = str => {
    console.error(new Date().toTimeString().substr(0, 8) + ' ' +  str);
};
function redirectLog(line = logLine, err = logError) {
    logLine = line;
    logError = err;
}

const commonModule = {
    logLine,
    logError,
    redirectLog
}
module.exports = Object.assign({}, commonModule);

function getTextNodeRecursively(el, maxDepth) {
    if (typeof maxDepth === 'undefined') {
        maxDepth = 5;
    }
    let $textElem = el;
    while ($textElem.type !== "text" && maxDepth > 0) {
        $textElem = $textElem.children[0];
        maxDepth--;
    }
    return $textElem;
};

function getEntryListPageAsync(page) {
    return new Promise((resolve, reject) => {
        let reqParams = {
            method: 'POST',
            host: NTHS_HOST,
            path: ENTRYLIST_PATH,
            headers: Object.assign({
                'Content-Type':   'application/x-www-form-urlencoded',
                'Content-Length': 12 + page.toString().length
            }, REQUEST_COMMON_HEADERS)
        };
        let responseCallback = res => {
            let body = '';
            res.on('data', data => {
                body += data;
            }).on('end', data => {
                body += data;
                resolve(body);
            }).on('error', err => {
                reject(err);
            });
        };
        try {
            // Operate the request.
            let req = http.request(reqParams, responseCallback);
            req.on('error', err => {
                reject(err);
            });
            req.write('currentPage=' + page, () => {
                req.end();
            });
        } catch (err) {
            reject(err);
        }
    });
};

function getFullPageAsync(url) {
    return new Promise((resolve, reject) => {
        let req = http.get({
            host: NTHS_HOST,
            path: url,
            headers: REQUEST_COMMON_HEADERS
        }, res => {
            let body = '';
            res.on('data', data => {
                body += data;
            }).on('end', data => {
                body += data;
                resolve(body);
            }).on('error', err => {
                reject(err);
            });
        })
    });
};

function getEntriesFromPageAsync(page) {
    return getEntryListPageAsync(page)
    .then(listBody => {
        let $document = cheerio.load(listBody);
        let $elems = $document(ENTRIES_SELECTOR);
        return Array.from($elems).map($elem => {
            let $title = getTextNodeRecursively($elem);
            return {
                url:   $elem.attribs.href,
                title: $title.data,
                time:  Date.parse($elem.parent.parent.children[4].children[0].data.slice(1, 17))
            };
        });
    });
};

function downloadAttachmentAsync(attachment) {
    // Create a file stream to write with.
    const stream = fs.createWriteStream(
        path.join(ARCHIVE_PATH, attachment.title),
        { encoding: 'binary' }
    );
    return new Promise((resolve, reject) => {
        const req = http.request(({
            host:    NTHS_HOST,
            path:    encodeURI(attachment.archive_url),
            headers: REQUEST_COMMON_HEADERS
        }), res => {
            const interval = setInterval(() => {
                logLine('Still fetching archive: ' + attachment.title);
            }, 60000);
            res.pipe(stream);
            res.on('end', () => {
                clearInterval(interval);
                logLine('Fetched archive: ' + attachment.title);
                resolve(attachment);
            }).on('error', err => {
                clearInterval(interval);
                logError('Failed fetching archive: ' + attachment.title);
                reject(err);
            });
        })
        req.on('error', err => {
            reject(err);
        });
        req.end()
    })
};

function fetchAttachmentsAsync(entry) {
    return getFullPageAsync(entry.url).then(body => {
        const $document = cheerio.load(body);
        const $hrefElems = $document(ATTACHMENT_SELECTOR);
        return Promise.map(Array.from($hrefElems), $hrefElem => {
            const $textElem = getTextNodeRecursively($hrefElem);
            const attachment = {
                title:           $textElem.data,
                category:        ($textElem.data.indexOf('高一') !== -1) ? '高一' : '高二',
                archive_url:     $hrefElem.attribs.href,
                page_url:        entry.url,
                file_name:       path.join(ARCHIVE_PATH, $textElem.data)
            }
            logLine('Fetching archive: ' + attachment.title + ' ' + attachment.archive_url);
            return downloadAttachmentAsync(attachment);
        });
    });
};

module.exports.crawler = Object.assign({
    getEntriesFromPageAsync,
    fetchAttachmentsAsync
}, commonModule);


function determineCategory(path) {
    for (let element of SUBJECTS) {
        if (path.indexOf(element) !== -1) {
            return element;
        }
    }
    return '杂项';
};

function spawnProcessAsync({
    program,
    args = [],
    outputCallback = (str, err) => {
        err ? logError(str) : logLine(str);
    }
}) {
    return new Promise(function(resolve, reject) {
        const process = childProcess.spawn(program, args);
        let state = 'init';
        process.stdout.on('data', function(data) {
            let str = data.toString();
            if (state !== 'out') {
                outputCallback(program + ' says:', false);
                state = 'out';
            }
            outputCallback(str, false);
        });
        process.stderr.on('data', function(data) {
            let str = data.toString();
            if (state !== 'error') {
                outputCallback(program + ' complains:'), true;
                state = 'error';
            }
            outputCallback(str, true);
        });
        process.on('close', function(code) {
            resolve(code);
        });
    });
}


// convmv -f utf8 -t ISO-8859-1 -r --notest *
// convmv -f gbk -t utf8 -r --notest *

function decodeDirAsync(encodeFrom, encodeTo, dir) {
    return spawnProcessAsync({
        program: 'convmv',
        args: ['-f', encodeFrom, '-t', encodeTo, '-r', '--notest', dir]
    });
}

function reencode(dir) {
    return decodeDirAsync('utf8', 'ISO-8859-1', dir).then(function(err) {
        if (err === 0) {
            logLine('convmv first done.');
            return decodeDirAsync('gbk', 'utf8', dir);
        } else if (err === 255) {
            logLine('convmv ignored.');
        }
    }, function(err) {
        logLine('convmv failed.');
    })
    .then(function() {
        logLine('convmv second done.')
    });
}

module.exports.extractor = Object.assign({
    spawnProcessAsync,
    reencode,
    determineCategory,
    moveAsync: Promise.promisify(fs.move)
}, commonModule);
