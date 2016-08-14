import { PostAsync } from './request';
import config from './ApiConfig';

class Crawler {
    static CrawlManually() {
        return PostAsync(`${config.apiPrefix}/crawl`, '');
    }
}

export default Crawler;

