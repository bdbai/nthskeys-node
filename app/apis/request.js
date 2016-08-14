import { Promise } from 'ES6Promise';

function sendRequestAsync(url, method = 'GET', data = '') {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 0 || xhr.status >= 200 && xhr.status < 400) {
                    const result = JSON.parse(xhr.responseText);
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
            xhr.open(method, url);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            const upperMethod = method.toUpperCase();
            if (upperMethod === 'POST' || upperMethod === 'PUT') {
                xhr.send(data);
            } else {
                xhr.send();
            }
        } catch (ex) {
            reject(ex);
        }
    });
}

export function GetAsync(url) {
    return sendRequestAsync(url);
}

export function PostAsync(url, data) {
    return sendRequestAsync(url, 'POST', data);
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
                const result = window.localStorage.getItem(valueKey);
                if (!!result) {
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

export default { GetAsync, PostAsync, GetOfflineAsync, OfflineConfirm };

