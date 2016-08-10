'use strict';

class Worker {
    constructor(models = null) {
        this.models = models;
        this._crawlerHandler = null;
    };

    get models() {
        if (this._models === null) {
            throw new Error('No DB models given.');
        }
        return this._models;
    }

    set models(val) {
        this._models = val;
    }

}

module.exports = Worker;
