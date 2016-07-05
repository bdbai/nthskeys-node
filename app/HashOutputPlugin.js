var fs = require('fs');
var path = require('path');

module.exports = function(outputFilePath) {
    return function() {
        this.plugin('done', function(stats) {
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
