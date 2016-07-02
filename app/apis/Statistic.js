import config from './ApiConfig';
import { GetAsync } from './request';

class Statistic {
    static getRankList() {
        return GetAsync(`${config.apiPrefix}/rank`);
    }
}

export default Statistic;
