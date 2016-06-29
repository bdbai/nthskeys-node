import jQuery from 'jQuery';

import config from './ApiConfig.js';

class Files {
    static hierachify(files) {
        let dirs = { dirs: new Map(), files: [], name: '目录' };
        for (let file of files) {
            let currentDir = dirs;
            let dirparts = (file.subject_category + '/' + file.path).split('/');
            dirparts.pop();
            for (let dirpart of dirparts) {
                if (typeof currentDir.dirs.get(dirpart) === 'undefined') {
                    currentDir.dirs.set(dirpart, { dirs: new Map(), files: [], name: dirpart });
                }
                currentDir = currentDir.dirs.get(dirpart);
            }
            currentDir.files.push(file);
        }
        return dirs;
    }
    static clearCache() {
        try {
            window.localStorage.clear();
        } catch (ex) { }
    }
    static getFiles() {
        let localFiles = { lastUpdate: 0, newFiles: [], files: [] };
        try {
            localFiles = JSON.parse(window.localStorage.getItem('file')) || localFiles;
        } catch (ex) { }
        return jQuery.ajax({
            url: `${config.apiPrefix}/files`,
            data: { last_update: localFiles.lastUpdate },
            dataType: 'json'
        }).then(apiResult => {
            let data = apiResult.result;
            let newDirs;
            if (data && data.length > 0) {
                localFiles.files.push(...data);
                newDirs = this.hierachify(data);
                localFiles.newFiles = data;
            } else {
                newDirs = this.hierachify(localFiles.newFiles);
            }
            try {
                window.localStorage.setItem('file', JSON.stringify({
                    lastUpdate: apiResult.timetick,
                    newFiles: localFiles.newFiles,
                    files: localFiles.files
                }));
            } catch (ex) { }

            let allDirs = this.hierachify(localFiles.files);
            
            let dfd = jQuery.Deferred();
            dfd.resolve({
                newDirs,
                allDirs
            });
            return dfd.promise();
        });
    }
    static getFilesByArchive(archiveId) {
        return jQuery.ajax({
            url: `${config.apiPrefix}/filesbyarchive`,
            data: { archive_id: archiveId }
        });
    }
}

export default Files;