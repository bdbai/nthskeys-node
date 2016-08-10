'use strict';
const Promise = require('bluebird');
const model = require('../lib/model');
const Crawler = require('../lib/crawler');
const Extractor = require('../lib/extractor');

let models = {};
model.then(_models => {
    models = _models;
    const c = new Crawler(models);
    return c.crawlAsync();
}).then(count => {
     console.log('Found ' + count + ' new archives.');
     return models.Archive.findOne({ title: process.env.ARCHIVE_NAME }).exec();
 }).then(archive => {
     const e = new Extractor(
         models,
         archive,
         process.env.ARCHIVE_PASS
     );
     return e.extractAsync();
 }).then(() => {
     console.log('Extraction done!');
     process.exit(0);
 }).catch(err => {
     console.error(err);
     process.exit(1);
 })
