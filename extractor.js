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

function logLine(str) {
    console.log(str);
}
function logError(str) {
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

function processFile(filePath, outerCategory, innerCategory) {
    logLine('Saving file: ' + filePath);
    var fileModel = new _models.File({
        path:       filePath,
        archive:    _archive,
        category:   innerCategory + '-' + outerCategory,
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
        if (fs.statSync(path.join(pathPrefix, dirName, element)).isFile()) {
            promises.push(processFile(
                path.join(dirName, element),
                outerCategory,
                innerCategory
            ));
        } else {
            processDir(
                pathPrefix,
                path.join(dirName, element),
                outerCategory,
                innerCategory
            );
        }
    }
    return Promise.all(promises);
}

function processRootDir(tmpDest) {
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
                innerCategory,
                element
            )
            if (fs.statSync(fullPath).isFile()) {
                promises.push(processFile(
                    element,
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

function extract(archivePath, password, outputCallback) {
    return new Promise(function(resolve, reject) {
        var tmpDest = path.join('/tmp', 'nthstemp' + Math.floor(Math.random() * 1000));
        var correctPassword = true;
        var extractProcess = childProcess.spawn('7z', ['x', '-y', '-bd', '-p' + password, '-o' + tmpDest, archivePath]);
        extractProcess.stdout.on('data', function(data) {
            var str = data.toString();
            if (str.indexOf('Wrong password?') !== -1) {
                correctPassword = false;
            }
            if (typeof outputCallback === 'function') {
                outputCallback(str);
            }
            logLine('7z says:');
            logLine(str);
        });
        extractProcess.on('close', function(code) {
            if (code === 0) {
                resolve(tmpDest);
            } else {
                // Wrong password: 2
                fs.removeSync(tmpDest);
                reject(new Error(code));
            }
        });
    });
}

module.exports = function(models, archive, password, outputCallback) {
    _models = models;
    _archive = archive;
    logLine('Extracting from: ' + archive.title);
    return extract(
        path.join(process.env.FILE_PATH, 'archive', archive.title),
        password,
        outputCallback
    ).then(function(tmpDest) {
        logLine('Extraction done. Saving...');
        return processRootDir(tmpDest).then(function() {
            logLine('Saved. Removing temp files...');
            fs.removeSync(tmpDest);
            logLine('Done!');
        });
    });
}
