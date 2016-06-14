import jQuery from 'jQuery';

import config from './ApiConfig.js';

class Files {
    static getFiles() {
        return jQuery.ajax({
            url: `${config.apiPrefix}/files`,
            dataType: 'json'
        });
    }
}

export default Files;