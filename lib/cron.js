const utils = require('./utils');

class Cron {
    constructor(_interval, _asyncWorkTodo, startImmediately = true) {
        this.workHandle = null;
        this.interval = _interval;
        this.asyncWorkTodo = _asyncWorkTodo;

        if (startImmediately) {
            this.startTiming();
        }
    }

    startTiming() {
        this.workHandle = setInterval(this.doWork, this.interval);
    }

    stopTiming() {
        if (this.workHandle !== null) {
            clearInterval(this.workHandle);
        }
    }

    doWork() {
        try {
            asyncWorkTodo().catch(err => {
                utils.logError('Async worker died!');
                utils.logError(err);
            });
        } catch (err) {
            utils.logError('Async worker failed!');
            utils.logError(err);
        }
    }
}

module.exports = Cron;
