'use strict';
const Promise = require('bluebird');
const mongoose = require('mongoose');
const schema = mongoose.Schema;

mongoose.Promise = Promise;

function setSchema() {

    // Archive
    const archiveSchema = new schema({
        title:       String,
        archive_url: String,
        page_url:    String,
        size:        Number,
        status:      { type: String, index: true, enum: ['unreleased', 'processing', 'released'], default: 'unreleased' },
        category:    { type: String, index: true },
        released_by: String,
        released_at: Date,
        password:    String,
        created_at:  { type: Date, index: true }
    });
    const Archive = mongoose.model('archive', archiveSchema);

    // File
    const fileSchema = new schema({
        path:             String,
        size:             Number,
        archive:          { type: schema.Types.ObjectId, ref: 'archive', index: true },
        click:            { type: Number, default: 0 },
        subject_category: { type: String, index: true },
        grade_category:   { type: String, index: true },
        created_at:       { type: Date, index: true }
    });
    const File = mongoose.model('file', fileSchema);

    // Crawler
    const crawlerSchema = new schema({
        last_entry_time:   { type: Date },
        last_crawl_time:   { type: Date }
    });
    crawlerSchema.statics.getCurrentCrawler = () => {
        return new Promise((resolve, reject) => {
            Crawler.findOne({}, (err, result) => {
                if (err !== null) {
                    reject(err);
                    return;
                }
                if (result === null) {
                    resolve(new Crawler({
                        last_entry_time: new Date(0),
                        last_crawl_time: new Date()
                    }));
                } else {
                    resolve(result);
                }
            });
        });
    }
    const Crawler = mongoose.model('crawler', crawlerSchema);

    return {
        Archive,
        File,
        Crawler
    };
}

module.exports = new Promise((resolve, reject) => {
    mongoose.connect(process.env.MONGODB_CONNECTION, err => {
        if (typeof err === 'undefined') {
            resolve(setSchema());
        } else {
            console.error('Error connecting to MongoDB:');
            console.error(err);
            reject(err);
        }
    });
})
