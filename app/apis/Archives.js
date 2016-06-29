import jQuery from 'jQuery';

import config from './ApiConfig.js';

class Archives {
    static getArchives() {
        return jQuery.ajax({
            url: `${config.apiPrefix}/archives`,
            cache: false,
            dataType: 'json'
        });
    }
}

export default Archives;