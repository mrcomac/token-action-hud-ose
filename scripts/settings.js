import { CUSTOM_STYLE, MODULE } from './constants.js'
/**
 * Register color settings
 */
function registerCustomStyleSettings () {
    for (const [key, value] of Object.entries(CUSTOM_STYLE)) {
        game.settings.register(MODULE.ID, key, {
            scope: 'client',
            config: false,
            type: value.type,
            default: value.default
        })
    }
}