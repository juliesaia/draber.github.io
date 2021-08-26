import {
    prefix
} from '../modules/string.js';
/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 * 
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import el from '../modules/element.js';
import Plugin from '../modules/plugin.js';
import Panel from './panel.js'

/**
 * Dark Mode plugin
 *
 * @param {App} app
 * @returns {Plugin} SideBar
 */
class SideBar extends Plugin {

    toggle(state){
        this.app.domSet('sidebar', state);
        return super.toggle(state);
    }

    /**
     * SideBar constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Modals in Sidebar', 'Uses sidebar instead of modals', {
            canChangeState: true
        });

        this.targetMinWidth = 1466;

        app.on(prefix('pluginsReady'), evt => {
            evt.detail.forEach(plugin => {
                if (!plugin.canChangeState || plugin === this) {
                    return false;
                }
                if(plugin.menuAction && plugin.menuAction.includes('sidebar')){
                    
                    const content = [el.summary({
                        content: plugin.title
                    })];
                    if(this.getState()) {
                        content.push(plugin.ui)
                    }
                    this.app.ui.append(el.details({
                        classNames: [prefix('sidebar-only', 'd')],
                        data: {
                            panel: plugin.key
                        },
                        events: {
                            toggle: evt => closeOthers(evt)
                        },
                        content
                    }))
                }
            })
            this.toggle(this.getState());
        })

    }
}

export default SideBar;