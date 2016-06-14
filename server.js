var Promise = require('bluebird');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('express-cors')

var model = require('./model');
var crawler = require('./crawler');
var extractor = require('./extractor');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

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
