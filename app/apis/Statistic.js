import config from './ApiConfig';
import { GetOfflineAsync } from './request';

class Statistic {
    static getRankList() {
        return GetOfflineAsync(`${config.apiPrefix}/rank`, 'rank');
    }
}

export default Statistic;

