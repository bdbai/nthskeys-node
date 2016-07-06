let serverHost = '';
let config = {};
if (process.env.NODE_ENV === 'development') {
    serverHost = 'http://192.168.1.100:9004';
}

config = {
    'apiPrefix': `${serverHost}/api`,
    'downloadPrefix': `${serverHost}/download`,
    'previewPrefix': `${serverHost}/preview`
};

export default config;
