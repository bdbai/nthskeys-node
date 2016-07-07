import config from './ApiConfig';
import { GetAsync } from './request';

let reloadReady = false;

function reload() {
    window.location.reload();
    throw new Error('Waiting for reloading...');
}

function prepareToReload() {
    if (reloadReady) {
        reload();
    } else {
        reloadReady = true;
    }
}

window.applicationCache.onupdateready = prepareToReload;

export default () => {
    let thisVersion = JSON.parse(window.localStorage.getItem('version'));
    GetAsync(`${config.apiPrefix}/version`)
    .then(result => {
        if (typeof thisVersion === 'undefined' || thisVersion === null) {
            window.localStorage.setItem('version', JSON.stringify(result));
            return;
        }
        if (result.hash !== thisVersion.hash) {
            let now = new Date();
            let year = now.getFullYear(),
                month = now.getMonth() + 1,
                day = now.getDate();
            if (confirm(`
                检测到新版本：${year}-${month}-${day}

                立即刷新？
            `)) {
                try {
                    window.localStorage.removeItem('version');
                } catch (ex) { }
                prepareToReload();
            }
        }
    }, () => {
        console.log('Failed checking version.');
    });
}