var Promise = require('bluebird');
var express = require('express');
var bodyParser = require('body-parser');

var model = require('./model');
var crawler = require('./crawler');
var extractor = require('./extractor');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('static'));

var models = {};

var apiRouter = express.Router();
apiRouter.route('/archives').get(function(req, res) {
    models.Archive.find({}).exec().then(function(result) {
        res.json(result);
    });
});

app.use('/api', apiRouter);

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
    // crawl();
    models.Archive.findOne({ title: '2014级高二寒假作业答案（2.20）.rar' })
    .exec().then(function(archive) {
        return extractor(models, archive, 'szsz3694hrcw6984');
    }).then(function() {
        console.log('Extraction done!');
    });
    app.listen(process.env.PORT || 9004);
});
