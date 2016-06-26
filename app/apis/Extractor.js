import jQuery from 'jQuery';

import config from './ApiConfig'; 

var Extractor = function(archiveId, releasePw, releaseBy, outputCallback = function() {}) {
    // Check validation
    if (!releasePw.match(/^szsz+\w{12}$/)) {
        throw new Error('密码格式似乎不对。');
    }
    if (releaseBy === '') {
        throw new Error('雷锋可是没有奖励的哟！请输入贡献者。');
    }
    
    let dfd = jQuery.Deferred();
    let xhr = new XMLHttpRequest();
    
    let processResponse = function() {
        outputCallback(xhr);
    }
    let stateChange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status >= 400 && xhr.status < 600) {
                dfd.reject(JSON.parse(xhr.responseText));
            } else {
                dfd.resolve();
            }
        }
    }
    let processError = function() {
        dfd.reject({ message: '网络错误。' });
    }
    
    xhr.onprogress = processResponse;
    xhr.onreadystatechange = stateChange;
    xhr.onerror = processError;
    xhr.open('POST', `${config.apiPrefix}/release`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        archive_id: archiveId,
        release_pw: releasePw,
        release_by: releaseBy
    }));
    
    return dfd.promise();
}

export default Extractor;
