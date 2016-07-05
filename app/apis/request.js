import { Promise } from 'ES6Promise';

export function GetAsync(url) {
    let p = new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 400) {
                    let result = JSON.parse(xhr.responseText);
                    resolve(result);
                } else {
                    reject(xhr);
                }
            }
        };
        xhr.onerror = () => {
            reject(xhr);
        };

        try {
            xhr.open('GET', url);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.send();
        } catch (ex) {
            reject(ex);
        }
    });
    return p;
}

export function GetOfflineAsync(url, valueKey) {
    return new Promise((resolve, reject) => {
        GetAsync(url)
        .then(result => {
            try {
                window.localStorage.setItem(valueKey, JSON.stringify(result));
            } catch (ex) { }
            resolve(result);
        }, err => {
            try {
                let result = window.localStorage.getItem(valueKey);
                if (typeof result !== 'undefined' && result !== null) {
                    OfflineConfirm();
                    resolve(JSON.parse(result));
                } else {
                    reject(err);
                }
            } catch (ex) {
                reject('Error while reading localStorage.');
            }
        });
    });
}

export function OfflineConfirm() {
    try {
        if (!window.localStorage.getItem('offlineConfirm') && confirm('离线模式。已经预览过的图片依然可用。\r\n不再提醒？')) {
            window.localStorage.setItem('offlineConfirm', true);
        }
        window.title += ' - 离线模式';
    } catch (ex) { }
}

export default { GetAsync, GetOfflineAsync, OfflineConfirm };