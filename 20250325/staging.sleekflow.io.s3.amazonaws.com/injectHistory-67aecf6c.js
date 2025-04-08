import { A as ActiveRouter } from './active-router-3a675f01.js';

function injectHistory(Component) {
    ActiveRouter.injectProps(Component, ['history', 'location']);
}

export { injectHistory as i };
