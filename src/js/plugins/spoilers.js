import el from '../modules/element.js';
import data from '../modules/data.js';
import {
	prefix
} from '../modules/string.js';
import Plugin from '../modules/plugin.js';
import tbl from '../modules/tables.js';

/**
 * Spoilers plugin
 * 
 * @param {App} app
 * @returns {Plugin} Spoilers
 */
class Spoilers extends Plugin {

	/**
	 * Get the data for the table cells
	 * @returns {Array}
	 */
	getData() {
		const counts = {};
		const pangramCount = data.getCount('pangrams');
		const foundPangramCount = data.getCount('foundPangrams');
		const cellData = [
			['', '✓', '?', '∑']
		];
		data.getList('answers').forEach(term => {
			counts[term.length] = counts[term.length] || {
				found: 0,
				missing: 0,
				total: 0
			};
			if (data.getList('foundTerms').includes(term)) {
				counts[term.length].found++;
			} else {
				counts[term.length].missing++;
			}
			counts[term.length].total++;
		});
		let keys = Object.keys(counts);
		keys.sort((a, b) => a - b);
		keys.forEach(count => {
			cellData.push([
				count + ' ' + (count > 1 ? 'letters' : 'letter'),
				counts[count].found,
				counts[count].missing,
				counts[count].total
			]);
		});
		cellData.push([
			'Pangrams',
			foundPangramCount,
			pangramCount - foundPangramCount,
			pangramCount
		]);
		return cellData;
	}

	constructor(app) {

		super(app, 'Spoilers', 'The number of words by length, also the number of pangrams', {
			canChangeState: true
		});

		// callback functions to conditionally add the css class `prefix(key, 'd')` to a table row
		this.cssMarkers = {
			completed: (rowData, i) => i > 0 && rowData[2] === 0,
			preeminent: (rowData, i) => i > 0 && rowData[0] === 'Pangrams',
		}

        // content pane        
        const pane = el.table({
            classNames: ['pane']
        });

        this.ui = el.details({
            html: [
                el.summary({
                    text: this.title
                }),
                pane
            ]
        });

		// update on demand
		app.on(prefix('wordsUpdated'), () => {
			tbl.get(this.getData(), pane);
			app.trigger(prefix('paneUpdated'), {
				plugin: this
			})
		});

		this.add();
	}
}
export default Spoilers;