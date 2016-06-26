var Promise = require('bluebird');
var childProcess = require('child_process');
var path = require('path');
var fs = require('fs-extra');

const SUBJECTS = [
    '语文',
    '数学',
    '英语',
    '物理',
    '化学',
    '历史',
    '地理',
    '政治',
    '生物',
    '杂项'
]
const DEST_PATH = path.join(process.env.FILE_PATH, 'file');

var _models = {};
var _archive = {};
var tmpDest = '';

var logLine = function(str) {
    console.log(str);
}
var logError = function(str) {
    console.error(str);
}

function determineCategory(path, categories) {
    var length = categories.length;
    for (var i = 0; i < length; i++) {
        var element = categories[i];
        if (path.indexOf(element) !== -1) {
            return element;
        }
    }
    return '杂项';
}

function processFile(filePath, fileSize, outerCategory, innerCategory) {
    logLine('Saving file: ' + filePath);
    var fileModel = new _models.File({
        path:             filePath,
        size:             fileSize,
        archive:          _archive,
        subject_category: innerCategory,
        grade_category:   outerCategory,
    });
    return fileModel.save().then(function() {
        logLine('File saved: ' + filePath);
    });
}

function processDir(pathPrefix, dirName, outerCategory, innerCategory) {
    logLine('Entering dir: ' + dirName);
    var promises = [];
    var contents = fs.readdirSync(path.join(pathPrefix, dirName));
    var length = contents.length;
    for (var i = 0; i < length; i++){
        var element = contents[i];
        var stat = fs.statSync(path.join(pathPrefix, dirName, element));
        if (stat.isFile()) {
            promises.push(processFile(
                path.join(dirName, element),
                stat.size,
                outerCategory,
                innerCategory
            ));
        } else {
            promises.push(processDir(
                pathPrefix,
                path.join(dirName, element),
                outerCategory,
                innerCategory
            ));
        }
    }
    return Promise.all(promises);
}

function processRootDir(outerCategory, tmpDest) {
    var moveAsync = Promise.promisify(fs.move);
    var promises = [];
    var contents = fs.readdirSync(tmpDest);
    var length = contents.length;
    for (var i = 0; i < length; i++) {
        (function() {
            var element = contents[i];
            var fullPath = path.join(tmpDest, element);
            var innerCategory = determineCategory(fullPath, SUBJECTS);
            var targetPath = path.join(
                DEST_PATH,
                outerCategory,
                innerCategory,
                element
            )
            var stat = fs.statSync(fullPath);
            if (stat.isFile()) {
                promises.push(processFile(
                    element,
                    stat.size,
                    _archive.category,
                    innerCategory
                ).then(function() {
                    return moveAsync(fullPath, targetPath, { clobber: true });
                }));
            } else {
                promises.push(processDir(
                    tmpDest,
                    element,
                    _archive.category,
                    innerCategory
                ).then(function() {
                    return moveAsync(fullPath, targetPath, { clobber: true });
                }));
            }
        })();
    }
    return Promise.all(promises);
}

// x -y -bd -p{password} -o{outputdir}

function extract(archivePath, password) {
    tmpDest = path.join('/tmp', 'nthstemp' + Math.floor(Math.random() * 1000));
    return new Promise(function(resolve, reject) {
        var wrongPassword = false;
        var extractProcess = childProcess.spawn('7z', ['x', '-y', '-bd', '-p' + password, '-o' + tmpDest, archivePath]);
        extractProcess.stdout.on('data', function(data) {
            var str = data.toString();
            if (!wrongPassword && str.indexOf('Wrong password?') !== -1) {
                wrongPassword = true;
            }
            logLine('7z says:');
            logLine(str);
        });
        extractProcess.stderr.on('data', function(data) {
            var str = data.toString();
            if (!wrongPassword && str.indexOf('Wrong password?') !== -1) {
                wrongPassword = true;
            }
            logLine('7z complains:');
            logLine(str);
        });
        extractProcess.on('close', function(code) {
            if (code === 0) {
                resolve();
            } else {
                fs.removeSync(tmpDest);
                if (wrongPassword) {
                    reject(new Error('Wrong password.'));
                } else {
                    reject(new Error('7z exits with ' + code));
                }
            }
        });
    });
}

module.exports = function(models, archive, password, logLineCallback, logErrorCallback) {
    _models = models;
    _archive = archive;
    if (typeof logLineCallback === 'function') {
        logLine = logLineCallback;
    }
    if (typeof logErrorCallback === 'function') {
        logError = logErrorCallback;
    }
    logLine('Extracting from: ' + archive.title);
    return extract(
        path.join(process.env.FILE_PATH, 'archive', archive.title),
        password
    ).then(function() {
        logLine('Extraction done. Saving...');
        return processRootDir(_archive.category, tmpDest)
    }).then(function() {
        logLine('Saved. Removing temp files...');
        fs.removeSync(tmpDest);
        logLine('Done!');
    });
}

