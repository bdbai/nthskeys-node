var Promise = require('bluebird');
var path = require('path');
var fs = require('fs-extra');
var ObjectId = require('mongoose').Types.ObjectId;
var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var cors = require('express-cors')

var model = require('./model');
var crawler = require('./crawler');
var extractor = require('./extractor');

const ARCHIVE_PW_REGEX = /^szsz+\w{12}$/;
const ACCESS_LOG_PATH = path.join(process.env.FILE_PATH, 'log', 'access.log');

(function prepare() {
    fs.ensureFileSync(ACCESS_LOG_PATH);
})();

const accessLogStream = fs.createWriteStream(ACCESS_LOG_PATH, {flags: 'a'});

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('combined', {stream: accessLogStream}));

// Define static source static m.w. .
app.use(express.static('static'));
// Define extracted file static m.w..
app.use('/download', express.static(
    path.join(process.env.FILE_PATH, 'file'),
    {
        maxAge: 31536000000
    })
);

if (process.env.NODE_ENV === 'development') {
    console.log('CORS enabled.');
    app.use(cors({
        allowedOrigins: [ 'localhost:8080' ]
    }));
}

var models = {};

var apiRouter = express.Router();
apiRouter.route('/archives').get(function(req, res) {
    models.Archive.find({}).exec().then(function(result) {
        res.json(result);
    });
});
apiRouter.route('/files').get(function(req, res) {
    models.File.find({}).exec().then(function(result) {
        res.json(result);
    });
});
app.use('/api', apiRouter);

global.archiveReleasing = false;
// Archive release
app.post('/release', function(req, res) {
    var archiveId = req.body.archive_id || '';
    var releasePw = req.body.release_pw || '';
    var releaseBy = req.body.release_by || '';
    // Check validation
    if (!archiveId || !releasePw) {
        res.status(400);
        res.json({ message: '输入有误。' });
        return;
    }
    if (!releasePw.match(ARCHIVE_PW_REGEX)) {
        res.status(400);
        res.json({ message: '密码格式似乎不对。' });
        return;
    }
    if (global.archiveReleasing) {
        res.status(503);
        res.json({ message: '有一个解压任务正在进行。' });
        return;
    }
    var archive;
    global.archiveReleasing = true;
    models.Archive.find({ _id: ObjectId(archiveId) })
    .exec().then(function(archives) {
        if (archives.length !== 1) {
            global.archiveReleasing = false;
            res.status(404);
            res.json({ message: '未找到该压缩包。' });
            return;
        }
        archive = archives[0];
        if (archive.status === 'released') {
            global.archiveReleasing = false;
            res.status(400);
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
        archive.released_by = releaseBy;
        archive.released_at = new Date();
        return archive.save();
    }, function(err) {
        global.archiveReleasing = false;
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
    app.listen(process.env.PORT || 9004);
});
