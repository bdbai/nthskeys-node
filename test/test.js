var Promise = require('bluebird');
var model = require('../model.js');
var crawler = require('../crawler.js');
var extractor = require('../extractor.js');

var models = {};
model.prepare.then(function(_models) {
    models = _models;
    crawler(models).then(function(count) {
        console.log('Found ' + count + ' new archives.');
        return models.Archive.findOne({ title: '2014级高二寒假作业答案（2.20）.rar' }).exec();
    }).then(function(archive) {
        return extractor(models, archive, 'szsz3694hrcw6984');
    }).then(function() {
        console.log('Extraction done!');
        process.exit();
    });
});
