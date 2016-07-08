var Promise = require('bluebird');
var model = require('../lib/model');
var crawler = require('../lib/crawler');
var extractor = require('../lib/extractor');

var models = {};
model.prepare.then(function(_models) {
    models = _models;
    crawler(models).then(function(count) {
        console.log('Found ' + count + ' new archives.');
        return models.Archive.findOne({ title: process.env.ARCHIVE_NAME }).exec();
    }).then(function(archive) {
        return extractor(models, archive, process.env.ARCHIVE_PASS);
    }).then(function() {
        console.log('Extraction done!');
        process.exit();
    }).catch(function(err) {
        console.error(err);
        process.exit(1);
    });
});
