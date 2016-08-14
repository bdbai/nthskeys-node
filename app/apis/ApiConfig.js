let serverHost = '';
if (process.env.NODE_ENV === 'development') {
    serverHost = 'http://192.168.1.100:9004';
}

const config = {
    'apiPrefix': `${serverHost}/api`,
    'downloadPrefix': `${serverHost}/download`,
    'previewPrefix': `${serverHost}/preview`
};

export default config;
