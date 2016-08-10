const path = require('path');
const fs = require('fs-extra');
const express = require('express');

const apiRouter = require('./apiRouter');
const previewRouter = require('./previewRouter');
const version = require('../static/version.json');

const STATIC_PATH = path.join(__dirname, '..', 'static');
const MANIFEST_CONTENT =
    fs.readFileSync(path.join(STATIC_PATH, 'cache.manifest'), 'UTF-8')
    + '\r\n/static/bundle.js?' + version.hash;

const mainRouter = express.Router();

// cache manifest
mainRouter.get('/cache.manifest', (req, res) => {
    res.write(MANIFEST_CONTENT);
    res.end();
});

// Define static source static m.w.
mainRouter.use(
    '/static',
    express.static(
        STATIC_PATH,
        { maxAge: 31536000000 }
    )
);

// Define extracted file static m.w.
mainRouter.use(
    '/download',
    express.static(
        path.join(process.env.FILE_PATH, 'file'),
        { maxAge: 31536000000 }
    )
);

// Mount routers
mainRouter.use(previewRouter);
mainRouter.use('/api', apiRouter);

// Main page
mainRouter.get('', (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(path.join(STATIC_PATH, 'index.html'));
});

module.exports = mainRouter;
