import { ActionHandler } from './action-handler.js'
import { RollHandler as Core } from './roll-handler.js'
import { DEFAULTS } from './defaults.js'

export let SystemManager = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    SystemManager = class SystemManager extends coreModule.api.SystemManager {
        /** @override */
        getCategoryManager () {
            return new coreModule.api.CategoryManager()
        }

        /** @override */
        getActionHandler (categoryManager) {
            console.log("ACTIONHANDLER")
            const actionHandler = new ActionHandler(categoryManager)
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
})
