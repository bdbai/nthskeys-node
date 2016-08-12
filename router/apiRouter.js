const express = require('express');
const ObjectId = require('mongoose').Types.ObjectId;

const model = require('../lib/model');
const Cron = require('../lib/cron');
const Crawler = require('../lib/crawler');
const Extractor = require('../lib/extractor');

const apiRouter = express.Router();
const crawler = new Crawler();
const version = require('../static/version.json');
const ARCHIVE_PW_REGEX = /^szsz(\d{12}\w{4}|\w{12})$/i;
let models = null;
let crawling = false;
let lastCrawlTime = new Date(0);
let archiveReleasing = false;

apiRouter.use((req, res, next) => {
    res.setHeader('Cache-Control', 'must-revalidate, max-age=5');
    next();
});


// Define crawler's cron job
function crawl() {
    if (crawling) {
        throw new Error('爬虫正在爬行中，请稍候。');
    }
    const now = new Date();
    if (now.getTime() - 300000 < lastCrawlTime.getTime()) {
        throw new Error('请让爬虫休息会儿。');
    }
    crawling = true;
    return crawler.crawlAsync().then(() => {
        crawling = false;
        lastCrawlTime = new Date();
    }, err => {
        crawling = false;
        utils.logError('Crawler died!');
        utils.logError(err);
    })
}

(() => {
    model.then(_models => {
        crawler.models = models = _models;
        const timingJob = new Cron(7200000, crawl);
        crawl();
    });
})();


apiRouter.route('/version').get((req, res) => {
    res.json(version);
});

apiRouter.route('/archives').get((req, res) => {
    models.Archive.find({})
    .sort({ created_at: -1 })
    .exec().then(result => {
        res.json(result);
    });
});

apiRouter.route('/files').get((req, res) => {
    res.setHeader('Cache-Control', 'no-cache, max-age=0');
    let queryObj = {};
    if (typeof req.query.last_update !== 'undefined') {
        queryObj = {
            created_at: { $gt: new Date(parseInt(req.query.last_update)) }
        }
    }
    models.File.find(queryObj).exec().then(result => {
        if (!result || result.length === 0) {
            res.json({
                result: [],
                timetick: req.query.last_update
            });
        } else if (result.length === 1) {
            res.json({
                result: result,
                timetick: result[0].created_at.getTime()
            });
        } else {
            const latestFile = result.reduce((prev, curr) => {
                return curr.created_at > prev.created_at ? curr : prev;
            });
            res.json({
                result: result,
                timetick: latestFile.created_at.getTime()
            });
        }
    });
});

apiRouter.route('/filesbyarchive').get((req, res) => {
    models.File.find({ 'archive': ObjectId(req.query.archive_id) })
    .exec().then(result => {
        res.json(result);
    });
});

apiRouter.route('/rank').get((req, res) => {
    models.Archive.aggregate([
        { $match: { status: "released" } },
        { $group: { _id: "$released_by", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ])
    .exec().then(result => {
        res.json(result);
    });
});

// Archive release
apiRouter.route('/release').post((req, res) => {
    const archiveId = req.body.archive_id || '';
    const releasePw = req.body.release_pw || '';
    const releaseBy = req.body.release_by || '';
    // Check validation
    if (!archiveId || !releasePw) {
        res.sendStatus(400);
        res.json({ message: '输入有误。' });
        return;
    }
    if (!releasePw.match(ARCHIVE_PW_REGEX)) {
        res.sendStatus(400);
        res.json({ message: '密码格式似乎不对。' });
        return;
    }
    if (archiveReleasing) {
        res.sendStatus(503);
        res.json({ message: '有一个解压任务正在进行。' });
        return;
    }
    let archive;
    archiveReleasing = true;
    models.Archive.find({ _id: ObjectId(archiveId) })
    .exec().then(archives => {
        if (archives.length !== 1) {
            archiveReleasing = false;
            res.sendStatus(404);
            res.json({ message: '未找到该压缩包。' });
            return;
        }
        archive = archives[0];
        if (archive.status === 'released') {
            archiveReleasing = false;
            res.sendStatus(400);
            res.json({ message: '已解压。' });
            return;
        }
        const extractor = new Extractor(
            models,
            archive,
            releasePw,
            line => {
                console.log(line);
                res.write(line + '\r\n');
            },
            err => {
                console.error(err);
                res.write(err + '\r\n');
            }
        )
        return extractor.extractAsync();
    }, err => {
        archiveReleasing = false;
        res.end('读取压缩包信息时出错。');
    }).then(() => {
        archive.status = 'released';
        archive.password = releasePw;
        archive.released_by = releaseBy;
        archive.released_at = new Date();
        return archive.save();
    }, err => {
        archiveReleasing = false;
        res.write(err.message);
        if (err.message === 'Wrong password.') {
            res.end('密码有误。');
        } else {
            res.end('解压时出错了。');
        }
    }).then(() => {
        archiveReleasing = false;
        res.end('解压完成。');
    }, err => {
        archiveReleasing = false;
        res.end('保存信息时出错了。');
    });
});

apiRouter.route('/crawl').post((req, res) => {
    try {
        crawl();
        res.json({ message: '爬虫已经在工作了。请耐心等一等， 然后回到“压缩包”页面。' });
    } catch (err) {
        res.status(400);
        res.json({ message: err.message });
    }
});

module.exports = apiRouter;
