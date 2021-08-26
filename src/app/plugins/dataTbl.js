/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import el from '../modules/element.js';
import {
    prefix
} from '../modules/string.js';
import Plugin from '../modules/plugin.js';

/**
 * DataTbl plugin
 *
 * @param {App} app
 * @returns {Plugin} DataTbl
 */
class DataTbl extends Plugin {

    /**
     * Build/refresh dataTbl
     * @param evt
     * @returns {DataTbl}
     */
    // eslint-disable-next-line no-unused-vars
    run(evt) {
        this.dataTbl = el.empty(this.dataTbl);
        const tbody = el.tbody();
        const data = this.getData();
        if (this.hasHeadRow) {
            this.dataTbl.append(this.buildHead(data.shift()));
        }
        const l = data.length;
        let colCnt = 0;
        data.forEach((rowData, i) => {
            colCnt = rowData.length;
            const classNames = [];
            for (const [marker, fn] of Object.entries(this.cssMarkers)) {
                if (fn(rowData, i, l)) {
                    classNames.push(prefix(marker, 'd'))
                }
            }
            const tr = el.tr({
                classNames
            })
            rowData.forEach((cellData, rInd) => {
                const tag = rInd === 0 && this.hasHeadCol ? 'th' : 'td';
                tr.append(el[tag]({
                    content: cellData
                }))
            })
            tbody.append(tr);
        });
        this.dataTbl.dataset.cols = colCnt;
        this.dataTbl.append(tbody);
        return this;
    }

    /**
     * Build thead
     * @param {Array} rowData
     * @returns {HTMLElement}
     */
    buildHead(rowData) {
        return el.thead({
            content: el.tr({
                content: rowData.map(cellData => el.th({
                    content: cellData
                }))
            })
        });
    }

    /**
     * Retrieve table view
     * @returns {HTMLElement}
     */
    getPane() {
        return this.dataTbl;
    }

    /**
     * @param app
     * @param title
     * @param description
     * @param canChangeState
     * @param defaultState
     * @param cssMarkers
     * @param hasHeadRow
     * @param hasHeadCol
     * @param {App} app
     */
    constructor(app, title, description, {
        canChangeState = true,
        defaultState = true,
        cssMarkers = {},
        hasHeadRow = true,
        hasHeadCol = true
    } = {}) {

        super(app, title, description, {
            canChangeState,
            defaultState
        });

        app.on(prefix('refreshUi'), () => {
            this.run();
        });

        this.cssMarkers = cssMarkers;
        this.hasHeadRow = hasHeadRow;
        this.hasHeadCol = hasHeadCol;
        this.dataTbl = el.table({
            classNames: ['pane', prefix('dataTbl', 'd')]
        });
    }
}

export default DataTbl;