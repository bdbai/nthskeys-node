import config from './ApiConfig';
import { GetAsync } from './request';

class Archives {
    static getArchives() {
        return GetAsync(`${config.apiPrefix}/archives`);
    }
}

export default Archives;