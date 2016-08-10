'use strict';
const Promise = require('bluebird');
const path = require('path');
const fs = require('fs-extra');

const utils = require('./utils').extractor;
const Worker = require('./worker');

const DEST_PATH = path.join(process.env.FILE_PATH, 'file');

// for private methods
const spawn7zAsync = Symbol();
const processFileAsync = Symbol();
const processDirAsync = Symbol();
const processRootDirAsync = Symbol();

class Extractor extends Worker {
    constructor(
        models = null,
        archive,
        password = '',
        logLineCallback = utils.logLine,
        logErrorCallback = utils.logError
    ) {
        super(models);

        this.archive = archive;
        this.password = password;
        this.archivePath = path.join(process.env.FILE_PATH, 'archive', this.archive.title);
        this.tmpDest = path.join('/tmp', 'nthstemp' + Math.floor(Math.random() * 1000));
        utils.redirectLog(logLineCallback, logErrorCallback);
    };

    [spawn7zAsync]() {
        let wrongPassword = false;
        return utils.spawnProcessAsync({
            program: '7z',
            args: [
                'x',                  // eXtract files with full paths
                '-y',                 // assume Yes on all queries
                '-bd',                // Disable percentage indicator
                '-p' + this.password, // set Password
                '-o' + this.tmpDest,  // set Output directory
                this.archivePath      // archive name
            ]
        }).then(code => {
            if (code > 1) {
                fs.removeSync(this.tmpDest);
                if (wrongPassword) {
                    throw new Error('Wrong password.');
                } else {
                    throw new Error('7z exits with ' + code);
                }
            }
        });
    }

    [processFileAsync](filePath, fileSize, outerCategory, innerCategory) {
        utils.logLine('Saving file: ' + filePath);
        let newFile = {
            path:             filePath,
            size:             fileSize,
            archive:          this.archive,
            subject_category: innerCategory,
            grade_category:   outerCategory,
            created_at:       new Date()
        };
        return this.models.File.findOneAndUpdate(
            { path: filePath },
            newFile,
            { upsert: true, setDefaultsOnInsert: true }
        ).then(() => {
            utils.logLine('File saved: ' + filePath);
        });
    }

    [processDirAsync](pathPrefix, dirName, outerCategory, innerCategory) {
        utils.logLine('Entering dir: ' + dirName);
        let contents = fs.readdirSync(path.join(pathPrefix, dirName));
        return Promise.map(contents, element => {
            let stat = fs.statSync(path.join(pathPrefix, dirName, element));
            if (stat.isFile()) {
                return this[processFileAsync](
                    path.join(dirName, element),
                    stat.size,
                    outerCategory,
                    innerCategory
                );
            } else {
                return this[processDirAsync](
                    pathPrefix,
                    path.join(dirName, element),
                    outerCategory,
                    innerCategory
                );
            }
        });
    };

    [processRootDirAsync](outerCategory) {
        const contents = fs.readdirSync(this.tmpDest);
        return Promise.map(contents, element => {
            const fullPath = path.join(this.tmpDest, element);
            const innerCategory = utils.determineCategory(fullPath);
            const targetPath = path.join(
                DEST_PATH,
                outerCategory,
                innerCategory,
                element
            )
            const stat = fs.statSync(fullPath);
            if (stat.isFile()) {
                return this[processFileAsync](
                    element,
                    stat.size,
                    this.archive.category,
                    innerCategory
                ).then(() => {
                    return utils.moveAsync(fullPath, targetPath, { clobber: true });
                });
            } else {
                return this[processDirAsync](
                    this.tmpDest,
                    element,
                    this.archive.category,
                    innerCategory
                ).then(() => {
                    return utils.moveAsync(fullPath, targetPath, { clobber: true });
                })
            }
        })
    };

    extractAsync() {
        utils.logLine('Extracting from: ' + this.archive.title);
        return this[spawn7zAsync]()
        .then(() => {
            utils.logLine('Trying to reencode...');
            return utils.reencode(this.tmpDest);
        }).then(() => {
            utils.logLine('Extraction done. Saving...');
            return this[processRootDirAsync](this.archive.category, this.tmpDest)
        }).then(() => {
            utils.logLine('Saved. Removing temp files...');
            return fs.remove(this.tmpDest);
        }).then(() => {
            utils.logLine('Done!');
        })
    };
}

module.exports = Extractor;
