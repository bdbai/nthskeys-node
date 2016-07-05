import config from './ApiConfig';
import { GetOfflineAsync } from './request';

class Archives {
    static getArchives() {
        return GetOfflineAsync(`${config.apiPrefix}/archives`, 'archives');
    }
}

export default Archives;