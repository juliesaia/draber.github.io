import {
    prefix
} from '../modules/string.js';
import el from '../modules/element.js';
import Plugin from '../modules/plugin.js';
import data from '../modules/data.js';

/**
 * Dark Mode plugin
 *
 * @param {App} app
 * @returns {Plugin} ProgressBar
 */
class ProgressBar extends Plugin {

    /**
     * Get current progress in % and refresh the bar
     * @param {Event} evt
     * @returns {Plugin}
     */
    run(evt) {
		if(!evt.detail.newData){
			return this;
		}
        let progress = data.getPoints('foundTerms') * 100 / data.getPoints('answers');
        progress = Math.min(Number(Math.round(progress + 'e2') + 'e-2'), 100);
        this.ui.value = progress;
        this.ui.textContent = el.toNode(progress + '%');
        this.ui.title = `Progress: ${progress}%`;
        return this;
    }

    /**
     * ProgressBar constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Progress Bar', 'Displays your progress as a yellow bar', {
            canChangeState: true,
            runEvt: prefix('refreshUi')
        });

        this.ui = el.progress({
            attributes: {
                max: 100
            }
        })   
    }
}

export default ProgressBar;
