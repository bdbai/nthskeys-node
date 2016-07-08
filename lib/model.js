var Promise = require('bluebird');
var mongoose = require('mongoose');
var schema = mongoose.Schema;

mongoose.Promise = Promise;

function setSchema() {

    // Archive
    var archiveSchema = new schema({
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
    var archiveModel = mongoose.model('archive', archiveSchema);

    // File
    var fileSchema = new schema({
        path:             String,
        size:             Number,
        archive:          { type: schema.Types.ObjectId, ref: 'archive', index: true },
        click:            { type: Number, default: 0 },
        subject_category: { type: String, index: true },
        grade_category:   { type: String, index: true },
        created_at:       { type: Date, index: true }
    });
    var fileModel = mongoose.model('file', fileSchema);

    // Crawler
    var crawlerSchema = new schema({
        last_entry_time: { type: Date },
        last_crawl_time:   { type: Date }
    });
    var crawlerModel = mongoose.model('crawler', crawlerSchema);

    return new Promise(function(resolve) {
        if (typeof resolve !== 'function')  {
            return;
        }
        resolve({
            Archive: archiveModel,
            File:    fileModel,
            Crawler: crawlerModel
        });
    });
}

var ret = Promise.promisify(mongoose.connection.once, { context: mongoose.connection })('open').then(function() {
    return setSchema();
});

mongoose.connect(process.env.MONGODB_CONNECTION);
module.exports = { prepare: ret };