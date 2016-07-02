var Promise = require('bluebird');
var model = require('./model');
var fs = require('fs-extra');
var path = require('path');
var http = require('http');
var cheerio = require('cheerio');

const NTHS_HOST = 'bdbai.tk';
const ARCHIVE_PATH = path.join(process.env.FILE_PATH, 'archive');
const ENTRYLIST_PATH= '/webschool/News/news_list.jsp?siteId=0&typeId=news33';
const ENTRIES_SELECTOR = 'body > table:nth-child(8) > tr:nth-child(2) > td:nth-child(2) > table:nth-child(2) > tr:nth-child(2) > td > table:nth-child(3) > tr > td > a';
const ATTACHMENT_SELECTOR = 'body > table:nth-child(9) > tr > td > table:nth-child(5) a[href^="/webschool/xheditor/upload/"]';

(function prepare() {
    fs.ensureDirSync(ARCHIVE_PATH);
})();

function logLine(str) {
    console.log(str);
}
function logError(str) {
    console.error(str);
}

function getMainPage(page) {
    return new Promise(function(resolve, reject) {
        var req = http.request({
            method: 'POST',
            host: NTHS_HOST,
            path: ENTRYLIST_PATH,
            headers: {
                'Content-Type':   'application/x-www-form-urlencoded',
                'Content-Length': 12 + new String(page).length
            }
        }, function(res) {
            var body = '';
            res.on('data', function(data) {
                body += data;
            }).on('end', function(data) {
                body += data;
                resolve(body);
            }).on('error', function(err) {
                reject(err);
            });
        });
        req.write('currentPage=' + page, function() {
            req.end();
        });
    });
}

function getEntries(listBody) {
    var ret = [];
    var $document = cheerio.load(listBody);
    var $elems = $document(ENTRIES_SELECTOR);
    for (var i = 0; i < $elems.length; i++) {
        var $elem = $elems[i];
        ret.push({ url:   $elem.attribs.href,
                   title: $elem.children[0].data,
                   time:  Date.parse($elem.parent.parent.children[4].children[0].data.slice(1, 17))
                });
    }
    return ret;
}

function getFullLink(url) {
    return new Promise(function(resolve, reject) {
        var req = http.get({
            host: NTHS_HOST,
            path: url
        }, function(res) {
            var body = '';
            res.on('data', function(data) {
                body += data;
            }).on('end', function(data) {
                body += data;
                resolve(body);
            }).on('error', function(err) {
                reject(err);
            });
        })
    });
}

function fetchAttachments(entry) {
    return getFullLink(entry.url).bind({}).then(function(body) {
        var $document = cheerio.load(body);
        var $hrefElem = $document(ATTACHMENT_SELECTOR)[0];
        var $textElem = $hrefElem.children[0];
        var maxDepth = 5;
        while ($textElem.type !== "text" && maxDepth > 0) {
            $textElem = $textElem.children[0];
            maxDepth--;
        }
        this.attachment =  {
            title:           $textElem.data,
            category:        ($textElem.data.indexOf('高一') !== -1) ? '高一' : '高二',
            archive_url:     $hrefElem.attribs.href,
            page_url:        entry.url
        };
        logLine('Fetching archive: ' + this.attachment.title + ' ' + this.attachment.archive_url);
        return new Promise(function(resolve, reject) {
            var that = this;
            var stream = fs.createWriteStream(path.join(ARCHIVE_PATH, this.attachment.title),
                {
                    encoding: 'binary'
                });
            var req = http.request({
                host: NTHS_HOST,
                path: encodeURI(that.attachment.archive_url)
            }, function(res) {
                res.pipe(stream);
                res.on('end', function() {
                    logLine('Fetched archive: ' + that.attachment.title);
                    resolve(that.attachment);
                }).on('error', function(e) {
                    logError('Failed fetching archive: ' + that.attachment.title);
                    reject(e);
                });
            });
            req.end();
        }.bind(this));
    });
}

var promiseSharedScope = {};

module.exports = function(_model) {
    promiseSharedScope.models = _model;
    var promise = Promise.all([
        // Load crawler info...
        promiseSharedScope.models.Crawler.findOne({}).exec(),
        // ... and crawl parallelly.
        getMainPage(3),
    ]).bind(promiseSharedScope).spread(function(crawler, page) {
        // Find out new entries.
        var newEntries = [];
        this.crawler = crawler || new this.models.Crawler({
            last_entry_time: new Date(0)
        });
        var lastEntryTime = this.crawler.last_entry_time;
        var entries = getEntries(page);
        this.latestEntryTime = entries.reduce(function(prev,curr) {
            if (curr.time > lastEntryTime &&
                typeof curr.title !== 'undefined' && // remove highlighted entries
                curr.title.indexOf('暑假作业') !== -1) {
                newEntries.push(curr);
            }
            return prev > curr.time ? prev : curr.time;
        });
        this.newEntryCount = newEntries.length;
        logLine('Crawler found ' + this.newEntryCount + ' new entries out of ' + entries.length);

        return Promise.all(newEntries.map(function(entry) {
            return fetchAttachments(entry);
         }));
    }).then(function(attachments) {
        // Save archives.
        return Promise.all(attachments.map(function(attachment) {
            var fileName = path.join(ARCHIVE_PATH, attachment.title);
            var archive = new this.models.Archive({
                title:         attachment.title,
                archive_url:   attachment.archive_url,
                page_url:      attachment.page_url,
                size:          fs.statSync(fileName).size,
                category:      attachment.category
            });
            logLine('Saving archive: ' + archive.title);
            return archive.save();
        }, this));
    }).then(function() {
        // Save new crawler info.
        this.crawler.last_entry_time = new Date(this.latestEntryTime);
        this.crawler.last_crawl_time = new Date();
        if (this.newEntryCount > 0) {
            logLine('Archive data saved. Saving crawling data.');
        }
        return this.models.Crawler.update(
            {},
            this.crawler,
            { upsert: true, setDefaultsOnInsert: true }
        );
    }).then(function() {
        return this.newEntryCount;
    });
    return promise;
}
