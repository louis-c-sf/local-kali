'use strict';

const activeRouter = require('./active-router-381b3b9a.js');

function injectHistory(Component) {
    activeRouter.ActiveRouter.injectProps(Component, ['history', 'location']);
}

exports.injectHistory = injectHistory;
