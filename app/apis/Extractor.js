import { Promise } from 'ES6Promise';

import config from './ApiConfig'; 

var Extractor = function(archiveId, releasePw, releaseBy, outputCallback = function() {}) {
    // Check validation
    if (!releasePw.match(/^szsz(\d{12}\w{4}|\w{12})$/i)) {
        throw new Error('密码格式似乎不对。');
    }
    if (releaseBy === '') {
        throw new Error('雷锋可是没有奖励的哟！请输入贡献者。');
    }
    
    let dfd = new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();

        let processResponse = function() {
            outputCallback(xhr);
        }
        let stateChange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 0 || xhr.status >= 400 && xhr.status < 600) {
                    reject(JSON.parse(xhr.responseText));
                } else {
                    resolve();
                }
            }
        }
        let processError = function() {
            reject({ message: '网络错误。' });
        }

        xhr.onprogress = processResponse;
        xhr.onreadystatechange = stateChange;
        xhr.onerror = processError;
        try {
            xhr.open('POST', `${config.apiPrefix}/release`);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify({
                archive_id: archiveId,
                release_pw: releasePw,
                release_by: releaseBy
            }));
        } catch (ex) {
            reject(ex);
        }


    });

    return dfd;
}

export default Extractor;
