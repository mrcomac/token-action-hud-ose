import { oseActionHandler } from './action-handler.js'
import { oseRollHandler as Core } from './roll-handler.js'
import { DEFAULTS } from './defaults.js'
import { MODULE, REQUIRED_CORE_MODULE_VERSION } from './constants.js'

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
            const choices = { core: coreTitle }
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
        requiredCoreModuleVersion: REQUIRED_CORE_MODULE_VERSION,
        SystemManager: oseSystemManager
    }
    Hooks.call('tokenActionHudSystemReady', module)
})
