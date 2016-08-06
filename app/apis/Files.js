import { Promise } from 'ES6Promise';

import config from './ApiConfig';
import { GetAsync, GetOfflineAsync, OfflineConfirm } from './request';

class Files {
    static unique(files) {
        let ret = [];
        let ids = new Map();
        for (let file of files) {
            let pointer = ids.get(file._id);
            if (typeof pointer === 'undefined') {
                ids.set(file._id, ret.push(file) - 1);
            } else {
                ret[pointer] = file;
            }
        }
        return ret;
    }
    static hierarchify(files) {
        let dirs = { dirs: new Map(), files: [], name: '目录' };
        for (let file of files) {
            let currentDir = dirs;
            let dirparts = file.path.split('/');
            dirparts.unshift(file.subject_category);
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
        let dfd = new Promise((resolve, reject) => {
            let newDirs = null;
            GetAsync(`${config.apiPrefix}/files?last_update=${localFiles.lastUpdate}`)
            .then(apiResult => {
                let data = apiResult.result;
                if (data && data.length > 0) {
                    if (localFiles.files.length > 0) {
                        newDirs = this.hierarchify(data);
                        localFiles.newFiles = data;
                    }
                    localFiles.files.push(...data);
                    localFiles.files = this.unique(localFiles.files);
                } else if (localFiles.newFiles.length !== 0) {
                    newDirs = this.hierarchify(localFiles.newFiles);
                }
                try {
                    window.localStorage.setItem('file', JSON.stringify({
                        lastUpdate: apiResult.timetick,
                        newFiles: localFiles.newFiles,
                        files: localFiles.files
                    }));
                } catch (ex) { }

                let allDirs = this.hierarchify(localFiles.files);

                resolve({
                    newDirs,
                    allDirs
                });
            }, () => {
                if (localFiles.files.length > 0) {
                    if (localFiles.newFiles.length > 0) {
                        newDirs = this.hierarchify(localFiles.newFiles);
                    }
                    let ret = {
                        'newDirs': newDirs,
                        'allDirs': this.hierarchify(localFiles.files)
                    }
                    OfflineConfirm();
                    resolve(ret);
                } else {
                    reject('Error while loading files.');
                }
            });

        });
        return dfd;
    }
    static getFilesByArchive(archiveId) {
        return GetOfflineAsync(`${config.apiPrefix}/filesbyarchive?archive_id=${archiveId}`, `archive_${archiveId}`);
    }
}

export default Files;