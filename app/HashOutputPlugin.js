const fs = require('fs');
const path = require('path');

function HashOutputPlugin(outputFilePath) {
    return function() {
        this.plugin('done', stats => {
            fs.writeFileSync(
                outputFilePath,
                JSON.stringify({
                    'build_time': new Date().getTime(),
                    'hash' : stats.hash
                })
            );
        })
    }
}

module.exports = HashOutputPlugin;

