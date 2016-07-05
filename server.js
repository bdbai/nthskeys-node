var Promise = require('bluebird');
var path = require('path');
var fs = require('fs-extra');
var ObjectId = require('mongoose').Types.ObjectId;
var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');

var model = require('./model');
var crawler = require('./crawler');
var extractor = require('./extractor');
var version = require('./static/version.json');

const ARCHIVE_PW_REGEX = /^szsz+\w{12}$/;
const ACCESS_LOG_PATH = path.join(process.env.FILE_PATH, 'log', 'access.log');

(function prepare() {
    fs.ensureFileSync(ACCESS_LOG_PATH);
})();

const accessLogStream = fs.createWriteStream(ACCESS_LOG_PATH, {flags: 'a'});

var app = express();
app.use(bodyParser.json());
app.use(morgan('combined', {stream: accessLogStream}));

// Define static source static m.w. .
app.use('/static', express.static('static',
    {
        maxAge: 31536000000
    })
);
// Define extracted file static m.w..
app.use('/download', express.static(
    path.join(process.env.FILE_PATH, 'file'),
    {
        maxAge: 31536000000
    })
);

if (process.env.NODE_ENV === 'development') {
    console.log('CORS enabled.');
    app.use(require('express-cors')({
        allowedOrigins: [ '192.168.1.100:8080', 'dd.bdbaifr1.ml:9005' ]
    }));
}

var models = {};

var apiRouter = express.Router();
apiRouter.use(function(req, res, next) {
    res.setHeader('Cache-Control', 'must-revalidate, max-age=15');
    next();
});
apiRouter.route('/version').get(function(req, res) {
    res.json(version);
});
apiRouter.route('/archives').get(function(req, res) {
    models.Archive.find({}).exec().then(function(result) {
        res.json(result);
    });
});
apiRouter.route('/files').get(function(req, res) {
    res.setHeader('Cache-Control', 'no-cache, max-age=0');
    var queryObj = {};
    if (typeof req.query.last_update !== 'undefined') {
        queryObj = {
            created_at: { $gt: new Date(parseInt(req.query.last_update)) }
        }
    }
    models.File.find(queryObj).exec().then(function(result) {
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
            var latestFile = result.reduce(function(prev, curr) {
                return curr.created_at > prev.created_at ? curr : prev;
            });
            res.json({
                result: result,
                timetick: latestFile.created_at.getTime()
            });
        }
    });
});
apiRouter.route('/filesbyarchive').get(function(req, res) {
    models.File.find({ 'archive': ObjectId(req.query.archive_id) })
    .exec().then(function(result) {
        res.json(result);
    });
});
apiRouter.route('/rank').get(function(req, res) {
    models.Archive.aggregate([
        { $match: { status: "released" } },
        { $group: { _id: "$released_by", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ])
    .exec().then(function(result) {
        res.json(result);
    });
});

global.archiveReleasing = false;
// Archive release
apiRouter.route('/release').post(function(req, res) {
    var archiveId = req.body.archive_id || '';
    var releasePw = req.body.release_pw || '';
    var releaseBy = req.body.release_by || '';
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
    if (global.archiveReleasing) {
        res.sendStatus(503);
        res.json({ message: '有一个解压任务正在进行。' });
        return;
    }
    var archive;
    global.archiveReleasing = true;
    models.Archive.find({ _id: ObjectId(archiveId) })
    .exec().then(function(archives) {
        if (archives.length !== 1) {
            global.archiveReleasing = false;
            res.sendStatus(404);
            res.json({ message: '未找到该压缩包。' });
            return;
        }
        archive = archives[0];
        if (archive.status === 'released') {
            global.archiveReleasing = false;
            res.sendStatus(400);
            res.json({ message: '已解压。' });
            return;
        }
        return extractor(models, archive, releasePw,
            function(logLine) {
                console.log(logLine);
                res.write(logLine + '\r\n');
            }, function(logError) {
                console.error(logError);
                res.write(logError + '\r\n');
            }
        );
    }, function(err) {
        global.archiveReleasing = false;
        res.end('读取压缩包信息时出错。');
    }).then(function() {
        archive.status = 'released';
        archive.password = releasePw;
        archive.released_by = releaseBy;
        archive.released_at = new Date();
        return archive.save();
    }, function(err) {
        global.archiveReleasing = false;
        res.write(err.message);
        if (err.message === 'Wrong password.') {
            res.end('密码有误。');
        } else {
            res.end('解压时出错了。');
        }
    }).then(function() {
        global.archiveReleasing = false;
        res.end('解压完成。');
    }, function(err) {
        global.archiveReleasing = false;
        res.end('保存信息时出错了。');
    });
});
app.use('/api', apiRouter);
app.get('/', function(req, res) {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

function crawl() {
    crawler(models).catch(function(err) {
        console.error('Crawler died!');
    });
}

setInterval(function() {
    crawl();
}, 7200000);

model.prepare.then(function(_models) {
    models = _models;
    crawl(models);
    app.listen(process.env.PORT || 9004, '0.0.0.0');
});
