import { Promise } from 'ES6Promise';
import config from './ApiConfig';
import { GetOfflineAsync } from './request';

(() => {
    window.archiveNewCountCallbacks = [];
})()

class Archives {
    static registerNewCount(callback) {
        return window.archiveNewCountCallbacks.push(callback) - 1;
    }
    static unregisterNewCount(handle) {
        delete window.archiveNewCountCallbacks[handle];
    }
    static getArchives() {
        for (let cb of window.archiveNewCountCallbacks) {
            if (typeof cb === 'function') {
                try {
                    cb();
                } catch (ex) { }
            }
        }
        return GetOfflineAsync(`${config.apiPrefix}/archives`, 'archives')
        .then((archives) => {
            let unreleasedArchives = archives.filter(archive => archive.status === 'unreleased');
            let unreleasedCount = unreleasedArchives.length;
            for (let cb of window.archiveNewCountCallbacks) {
                if (typeof cb === 'function') {
                    try {
                        cb(unreleasedCount);
                    } catch (ex) { }
                }
            }
            return new Promise((resolve, reject) => {
                resolve(archives);
            });
        });
    }
}

export default Archives;