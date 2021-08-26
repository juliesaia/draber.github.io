/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import data from '../modules/data.js';
import DataTbl from './dataTbl.js';
import el from '../modules/element.js';

/**
 * Score so far plugin
 *
 * @param {App} app
 * @returns {Plugin} Score
 */
class Score extends DataTbl {

    /**
     * Build table data set
     * @returns {Array}
     */
    getData() {
        const keys = ['foundTerms', 'remainders', 'answers'];
        return [
            ['', '✓', '?', '∑'],
            ['W'].concat(keys.map(key => data.getCount(key))),
            ['P'].concat(keys.map(key => data.getPoints(key)))
        ];
    }

    /**
     * Score constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Score', 'The number of words and points and how many have been found');

        this.ui = el.details({
            attributes: {
                open: true
            },
            content: [
                el.summary({
                    content: this.title
                }),
                this.getPane()
            ]
        });
    }
}

export default Score;