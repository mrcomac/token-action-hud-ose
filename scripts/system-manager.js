import { oseActionHandler } from './action-handler.js'
import { oseRollHandler as Core } from './roll-handler.js'
import { DEFAULTS } from './defaults.js'
import { MODULE } from './constants.js'

export let oseSystemManager = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    oseSystemManager = class OSESystemManager extends coreModule.api.SystemManager {
        /** @override */
        getCategoryManager () {
            return new coreModule.api.CategoryManager()
        }

        /** @override */
        getActionHandler (categoryManager) {
            const actionHandler = new oseActionHandler(categoryManager)
            return actionHandler
        }

        /** @override */
        getAvailableRollHandlers () {
            let coreTitle = 'Core OSE'
            //if (coreModule.api.Utils.isModuleActive('midi-qol')) { coreTitle += ` [supports ${coreModule.api.Utils.getModuleTitle('midi-qol')}]` }
            const choices = { core: coreTitle }
            //coreModule.api.SystemManager.addHandler(choices, 'obsidian')
            return choices
        }

        /** @override */
        getRollHandler (handlerId) {
            let rollHandler
            switch (handlerId) {
                case 'core':
                default:
                    rollHandler = new Core()
                    break
            }

            return rollHandler
        }

        /** @override */
        registerSettings (updateFunc) {
            // systemSettings.register(updateFunc)
        }

        /** @override */
        async registerDefaults () {
            const defaults = DEFAULTS
            return defaults
        }
    }

    /* STARTING POINT */

    const module = game.modules.get(MODULE.ID);
    module.api = {
        requiredCoreModuleVersion: '1.5',
        SystemManager: oseSystemManager
    }
    Hooks.call('tokenActionHudSystemReady', module)
})
