import { Promise } from 'ES6Promise';

import config from './ApiConfig';
import { GetAsync } from './request';

class Files {
    static hierarchify(files) {
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
        let dfd = new Promise((resolve, reject) => {
            GetAsync(`${config.apiPrefix}/files?last_update=${localFiles.lastUpdate}`)
            .then(apiResult => {
                let data = apiResult.result;
                let newDirs;
                if (data && data.length > 0) {
                    localFiles.files.push(...data);
                    newDirs = this.hierarchify(data);
                    localFiles.newFiles = data;
                } else {
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
                    let ret = {
                        'newDirs': this.hierarchify(localFiles.newFiles),
                        'allDirs': this.hierarchify(localFiles.files)
                    }
                    try {
                        if (!window.localStorage.getItem('offlineConfirm') && confirm('离线模式。已经缓存过的文件依然可用。\r\n不再提醒？')) {
                            window.localStorage.setItem('offlineConfirm', true);
                        }
                    } catch (ex) { }
                    resolve(ret);
                } else {
                    reject('Error while loading files.');
                }
            });

        });
        return dfd;
    }
    static getFilesByArchive(archiveId) {
        return GetAsync(`${config.apiPrefix}/filesbyarchive?archive_id=${archiveId}`);
    }
}

export default Files;