import { GROUP } from './constants.js'

/**
 * Default categories and groups
 */
export let DEFAULTS = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    const groups = GROUP
    Object.values(groups).forEach(group => {
        group.name = coreModule.api.Utils.i18n(group.name)
        group.listName = `Group: ${coreModule.api.Utils.i18n(group.name)}`
    })
    const groupsArray = Object.values(groups)
    DEFAULTS = {
        layout: [
            {
                nestId: 'attributes',
                id: 'attributes',
                name: coreModule.api.Utils.i18n('OSE.category.abilities'),
                groups: [
                    { ...groups.abilities, nestId: 'attributes_abilities' },
                    { ...groups.saves, nestId: 'attributes_saves' },
                    { ...groups.extra, nestId: 'attributes_extra' }
                ]
            },
            {
                nestId: 'inventory',
                id: 'inventory',
                name: coreModule.api.Utils.i18n('OSE.category.inventory'),
                groups: [
                    { ...groups.armors, nestId: 'inventory_armors' },
                    { ...groups.weapons, nestId: 'inventory_weapons' },
                    { ...groups.misc, nestId: 'inventory_misc' }
                    /*{ ...groups.consumables, nestId: 'inventory_consumables' },
                    { ...groups.tools, nestId: 'inventory_tools' },
                    { ...groups.containers, nestId: 'inventory_containers' },
                    { ...groups.loot, nestId: 'inventory_loot' }*/
                ]
            },
            {
                nestId: 'spells',
                id: 'spells',
                name: coreModule.api.Utils.i18n('OSE.category.spells'),
                groups: [
                    { ...groups._1stLevelSpells, nestId: 'spells_1st-level-spells' },
                    { ...groups._2ndLevelSpells, nestId: 'spells_2nd-level-spells' },
                    { ...groups._3rdLevelSpells, nestId: 'spells_3rd-level-spells' },
                    { ...groups._4thLevelSpells, nestId: 'spells_4th-level-spells' },
                    { ...groups._5thLevelSpells, nestId: 'spells_5th-level-spells' },
                    { ...groups._6thLevelSpells, nestId: 'spells_6th-level-spells' },
                    { ...groups._7thLevelSpells, nestId: 'spells_7th-level-spells' },
                    { ...groups._8thLevelSpells, nestId: 'spells_8th-level-spells' },
                    { ...groups._9thLevelSpells, nestId: 'spells_9th-level-spells' }
                ]
            }
        ],
        groups: groupsArray
    }
})