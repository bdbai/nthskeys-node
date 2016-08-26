'use strict';
const Promise = require('bluebird');
const path = require('path');
const fs = require('fs-extra');

const utils = require('./utils').crawler;
const model = require('./model');
const Worker = require('./worker');
const Cron = require('./cron');

// for private methods
const processNewEntries = Symbol();
const saveArchives = Symbol();
const saveCrawler = Symbol();

class Crawler extends Worker {
    constructor(models = null) {
        super(models);

        this._crawlerHandler = null;
    };

    get crawlerHandler() {
        if (this._crawlerHandler !== null) {
            return this._crawlerHandler;
        }
        this._crawlerHandler = this.models.Crawler.getCurrentCrawler()
        .then(crawler => {
            this.crawler = crawler;
        });
        return this._crawlerHandler;
    }

    [processNewEntries](entries) {
        const newEntries = [];
        const lastEntryTime = this.crawler.last_entry_time;
        this.latestEntryTime = lastEntryTime;
        for (const entry of entries) {
            if (entry.time > lastEntryTime &&
                entry.title.indexOf(process.env.CRAWLER_KEYWORD || '暑假作业') !== -1
            ) {
                newEntries.push(entry);
            }
            this.latestEntryTime = Math.max(entry.time, this.latestEntryTime);
        }
        this.newEntryCount = newEntries.length;
        utils.logLine('Crawler found ' + this.newEntryCount + ' new entries out of ' + entries.length);

        return Promise.map(newEntries, entry => {
            return utils.fetchAttachmentsAsync(entry)
            .then(attachments => this[saveArchives](attachments));
        })
    };

    [saveArchives](attachments) {
        return Promise.map(attachments, attachment => {
            const archive = new this.models.Archive({
                title:         attachment.title,
                archive_url:   attachment.archive_url,
                page_url:      attachment.page_url,
                size:          fs.statSync(attachment.file_name).size,
                category:      attachment.category,
                created_at:    new Date()
            });
            utils.logLine('Saving archive: ' + archive.title);
            return archive.save();
        });
    };

    [saveCrawler]() {
        // Save new crawler info.
        this.crawler.last_entry_time = new Date(this.latestEntryTime);
        this.crawler.last_crawl_time = new Date();
        if (this.newEntryCount > 0) {
            utils.logLine('Archive data saved. Saving crawling data.');
        }
        return this.crawler.save();
    }

    crawlAsync()  {
        return Promise.join(
            // Load crawler info...
            this.crawlerHandler,
            // ... and crawl parallelly.
           utils.getEntriesFromPageAsync(process.env.CRAWLER_PAGE || 1)
        )
        .spread((_, page) => this[processNewEntries](page))
        .then(() => this[saveCrawler]())
        .then(() => this.newEntryCount);
    };
}

module.exports = Crawler;
