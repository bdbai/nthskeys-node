import jQuery from 'jQuery';

import config from './ApiConfig';

class Statistic {
    static getRankList() {
        return jQuery.ajax({
            url: `${config.apiPrefix}/rank`,
            cache: false,
            dataType: 'json'
        });
    }
}

export default Statistic;
