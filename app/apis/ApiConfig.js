let serverHost = '';
let config = {};
if (process.env.NODE_ENV === 'development') {
    serverHost = 'http://localhost:9004';
}

config = {
    'apiPrefix': `${serverHost}/api`,
    'downloadPrefix': `${serverHost}/download`
};

export default config;
