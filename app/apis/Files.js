import { Promise } from 'ES6Promise';

import config from './ApiConfig';
import { GetAsync, GetOfflineAsync, OfflineConfirm } from './request';

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

class Files {
    static determineCategory(path) {
        for (let element of SUBJECTS) {
            if (path.indexOf(element) !== -1) {
                return element;
            }
        }
        return '杂项';
    }
    static unique(files) {
        const ret = [];
        const ids = new Map();
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
        const dirs = { dirs: new Map(), files: [], name: '目录' };
        for (let file of files) {
            let currentDir = dirs;
            const realCategory = this.determineCategory(file.subject_category + file.path);
            const dirparts = file.path.split('/');
            dirparts.pop();
            dirparts.unshift(realCategory);
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
        return new Promise((resolve, reject) => {
            let newDirs = null;
            GetAsync(`${config.apiPrefix}/files?last_update=${localFiles.lastUpdate}`)
            .then(apiResult => {
                const data = apiResult.result;
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

                const allDirs = this.hierarchify(localFiles.files);

                resolve({
                    newDirs,
                    allDirs
                });
            }, () => {
                if (localFiles.files.length > 0) {
                    if (localFiles.newFiles.length > 0) {
                        newDirs = this.hierarchify(localFiles.newFiles);
                    }
                    const ret = {
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
    }
    static getFilesByArchive(archiveId) {
        return GetOfflineAsync(`${config.apiPrefix}/filesbyarchive?archive_id=${archiveId}`, `archive_${archiveId}`);
    }
}

export default Files;

