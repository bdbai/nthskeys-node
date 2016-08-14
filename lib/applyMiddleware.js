const path = require('path');
const fs = require('fs-extra');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const ACCESS_LOG_PATH = path.join(process.env.FILE_PATH, 'log', 'access.log');
const accessLogStream = fs.createWriteStream(ACCESS_LOG_PATH, {flags: 'a'});

(function prepare() {
    fs.ensureFileSync(ACCESS_LOG_PATH);
})();

function apply(app) {
    app.use(bodyParser.json());
    app.use(morgan('combined', { stream: accessLogStream }));

    if (process.env.NODE_ENV === 'development') {
        console.log('CORS enabled.');
        app.use(require('express-cors')({
            allowedOrigins: [
                '192.168.1.100:8080',
                'localhost:8080'
            ]
        }));
    }
}

module.exports = apply;
