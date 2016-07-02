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

export default { GetAsync };