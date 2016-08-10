const express = require('express');

const previewRouter = express.Router();

previewRouter.route('/preview/:filePath').get((req, res) => {
    const filePath = req.params.filePath;
    res.send(
        `<html manifest="/preview_manifest/${encodeURIComponent(filePath)}">
        <head><title>Untitled</title><body>
        <img alt="preview" src="/download/${filePath}" />
        </body></html>`
    );
});

previewRouter.route('/preview_manifest/:filePath').get((req, res) => {
    res.setHeader('Content-Type', 'text/cache-manifest');
    res.send(`CACHE MANIFEST
CACHE
/download/${encodeURI(req.params.filePath)}`);
});

module.exports = previewRouter;
