import jQuery from 'jQuery';

const apiPrefix = 'http://localhost:9004/api';

class Archive {
    static getArchives() {
        return jQuery.ajax({
            url: `${apiPrefix}/archives`,
            dataType: 'json'
        });
    }
}

export default Archive;