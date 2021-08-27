/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import {
    prefix
} from '../modules/string.js';
import TablePane from './tablePane.js';
import levenshtein from 'js-levenshtein';
import data from '../modules/data.js';
import el from '../modules/element.js';

// noinspection SpellCheckingInspection
/**
 * Link all term to Google
 *
 * @param {App} app
 * @returns {Plugin} SimilarWords
 */
class SimilarWords extends TablePane {

    /**
     * Build table data set
     * @returns {Array}
     */
    getData() {
        const data = [];
        for (let [similarity, text] of Object.entries({
                startsWith: '…start with the same 3 letters',
                contained: '…are part of other terms',
                levenshtein: '…differ by one letter',
                contains: '…contain other terms'
            })) {
            data.push([
                el.mark({
                    classNames: [prefix(similarity, 'd')]
                }),
                text
            ])
        }
        return data;
    }

    /**
     * Find terms from the remainder list that are similar to terms already found
     * @returns {Object}
     */
    getSimilarWords() {
        const remainders = data.getList('remainders');
        const similars = {};
        data.getList('foundTerms').forEach(foundTerm => {
            const candidates = {
                startsWith: remainders.filter(remainder => foundTerm !== remainder && remainder.startsWith(foundTerm.substr(0, 3))).length,
                contained: remainders.filter(remainder => foundTerm !== remainder && remainder.includes(foundTerm)).length,
                levenshtein: remainders.filter(remainder => foundTerm !== remainder && levenshtein(remainder, foundTerm) === 1).length,
                contains: remainders.filter(remainder => foundTerm !== remainder && foundTerm.includes(remainder)).length
            }
            let allover = 0;
            for (let [similarity, count] of Object.entries(candidates)) {
                allover += count;
                if (count === 0) {
                    delete candidates[similarity];
                }
            }
            if (allover) {
                similars[foundTerm] = candidates;
            }

        })
        return similars;
    }

    /**
     * Toggle state
     * @param {Boolean} state
     * @returns {SimilarWords}
     */
    toggle(state) {
        super.toggle(state);
        return this.run();
    }

    /**
     * Add or remove pangram underlines
     * @param evt
     * @returns {SimilarWords}
     */
    // eslint-disable-next-line no-unused-vars
    run(evt = null) {
        const holderClass = prefix('marks', 'd');
        el.$$('.' + holderClass, this.app.resultList).forEach(mark => mark.remove());
        const similars = this.getSimilarWords();
        const terms = Object.keys(similars);
        el.$$('li', this.app.resultList).forEach(li => {
            const foundTerm = li.textContent.trim();
            if (terms.includes(foundTerm)) {
                const holder = el.span({
                    classNames: [holderClass]
                })
                Object.keys(similars[foundTerm]).forEach(similarity => {
                    holder.append(el.mark({
                        classNames: [prefix(similarity, 'd')]
                    }))
                })
                li.append(holder);
            }
        })
        return this;
    }


    /**
     * SimilarWords constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Similar Words', 'Hints on words that are similar', {
            canChangeState: false,
            runEvt: prefix('refreshUi')
        });
        this.run()

        this.ui = el.details({
            content: [
                el.summary({
                    content: this.title
                }),
                [
                    el.div({
                        content: 'Hint on words that…'
                    }),
                    this.getPane()
                ]
            ]
        });
    }
}

export default SimilarWords;