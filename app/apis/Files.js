import jQuery from 'jQuery';

import config from './ApiConfig.js';

class Files {
    static getFiles() {
        return jQuery.ajax({
            url: `${config.apiPrefix}/files`,
            dataType: 'json'
        }).then(data => {
            let dirs = { dirs: new Map(), files: [], name: '目录' };
            for (let file of data) {
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
            
            let dfd = jQuery.Deferred();
            dfd.resolve(dirs);
            return dfd.promise();
        });
    }
}

export default Files;