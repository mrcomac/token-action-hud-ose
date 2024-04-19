export let oseActionHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    oseActionHandler = class OSEActionHandler extends coreModule.api.ActionHandler {

        /**
         * Build System Actions
         * @override
         * @param {array} groupIds
         * @returns {object}
         */
        async buildSystemActions(groupIds) {
            this.actors = (!this.actor) ? this.#getActors() : [this.actor]
            this.tokens = (!this.token) ? this.#getTokens() : [this.token]
            this.actorType = this.actor?.type
            this.#buildCharacterActions()
        }
        /**
        * Build character actions
        * @private
        * @returns {object}
        */
        async #buildCharacterActions() {
            this.#buildAttributes('attribute', 'attributes')
            this.#buildSaves('save', 'saves')
            this.#buildAbilities('ability', 'abilities')
            this.#buildSpells()
            this.#buildItems()
        }

        #buildItems() {
            this.#buildInventoryContainer()
            this.#buildInventory('armor', ['armor'])
            this.#buildWeapons('weapon', ['weapon'])
            this.#buildInventory('misc', ['item'])
            this.#buildTreasure('treasure', ['item'])
        }
        async #buildInventoryContainer() {
            const itemTypes = 'container'
            const parentgroupData = { id: 'inventory', type: 'custom' }
            for (const [_, container] of Object.entries(this.actor.items.filter(el => itemTypes.includes(el.type) && el.system.itemIds.length > 0))) {
                const groupDataClone = { id: `container_${container.id}`, name: container.name, type: 'list' }
                await this.addGroup(groupDataClone, parentgroupData, true)
                this.#buildContainer(container.system.itemIds, container, groupDataClone)
            }
        }

        #buildContainer(items, container, groupData) {
            let actions = []
            for (const itemId of items) {
                const item = this.actor.items.get(itemId)
                const actionType = item.type
                const abilityId = item.id
                const id = `${actionType}-${item.id}`
                const label = item.name
                const name = item.name
                const listName = `${actionType}${label}`
                const encodedValue = [actionType, abilityId].join(this.delimiter)
                const img = item.img
                const info2 = { text: item.system?.damage ? "(" + item[1].system.damage + ")" : "(" + item.system.quantity.value + ")", class: 'custominfo' }
                const cssClass = ''
                actions.push({
                    id,
                    name,
                    encodedValue,
                    info2,
                    img,
                    cssClass,
                    listName
                })
            }
            this.addActions(actions, groupData)
        }

        /**
         * Build Weapons
         * @private
         * @param {string} groupId
         * @param {string} itemTypes
         */
        #buildWeapons(groupId, itemTypes) {
            this.#buildMeleeWeapons(groupId, itemTypes)
            this.#buildRangedWeapons(groupId, itemTypes)
        }

        /**
         * Build Melee Weapons
         * @private
         * @param {string} groupId
         * @param {string} itemTypes
         */
        #buildMeleeWeapons(groupId, itemTypes) {
            const actionType = groupId
            const actions = Object.entries(
                this.actor.items.filter(
                    el => itemTypes.includes(el.type) 
                    && el.system.containerId == '' 
                    && el.system.melee)).map((item) => {
                const abilityId = item[1].id
                const id = `${actionType}-${item[1].id}`
                const label = item[1].name
                const name = item[1].name
                const listName = `${actionType}${label}`
                const encodedValue = [actionType, abilityId].join(this.delimiter)
                const img = item[1].img
                const info2 = { text: item[1].system?.damage ? "(" + item[1].system.damage + ")" : "(" + item[1].system.quantity.value + ")", class: 'custominfo' }
                const cssClass = ''
                return {
                    id,
                    name,
                    encodedValue,
                    info2,
                    img,
                    cssClass,
                    listName
                }
            })
            const groupData = { id: 'melee', type: 'system' }
            this.addActions(actions, groupData)
        }

        /**
         * Build Ranged Weapons
         * @private
         * @param {string} groupId
         * @param {string} itemTypes
         */
        #buildRangedWeapons(groupId, itemTypes) {
            const actionType = groupId
            
            const actions = Object.entries(
                this.actor.items.filter(
                    el => itemTypes.includes(el.type) 
                    && el.system.containerId == '' 
                    && el.system.missile)).map((item) => {
                const abilityId = item[1].id
                const id = `${actionType}-${item[1].id}`
                const label = item[1].name
                const name = item[1].name
                const listName = `${actionType}${label}`
                const encodedValue = [actionType, abilityId].join(this.delimiter)
                const img = item[1].img
                const info2 = { text: item[1].system?.damage ? "(" + item[1].system.damage + ")" : "(" + item[1].system.quantity.value + ")", class: 'custominfo' }
                const cssClass = ''
                return {
                    id,
                    name,
                    encodedValue,
                    info2,
                    img,
                    cssClass,
                    listName
                }
            })
            const groupData = { id: 'ranged', type: 'system' }
            this.addActions(actions, groupData)
        }

        /**
         * Build Inventory
         * @private
         * @param {string} groupId
         * @param {string} itemTypes
         */
        #buildInventory(groupId, itemTypes) {
            const actionType = groupId
            const actions = Object.entries(
                this.actor.items.filter(
                    el => itemTypes.includes(el.type) 
                    && el.system.containerId == '' 
                    && !el.system.treasure)).map((item) => {
                if (item[1].system.melee) range = coreModule.api.Utils.i18n('OSE.items.Melee')
                else if (item[1].system.missile) range = coreModule.api.Utils.i18n('OSE.items.Missile')
                const abilityId = item[1].id
                const id = `${actionType}-${item[1].id}`
                const label = item[1].name
                const name = item[1].name
                const listName = `${actionType}${label}`
                const encodedValue = [actionType, abilityId].join(this.delimiter)
                const img = item[1].img
                const info2 = { text: item[1].system?.damage ? "(" + item[1].system.damage + ")" : "(" + item[1].system.quantity.value + ")", class: 'custominfo' }
                const cssClass = ''
                return {
                    id,
                    name,
                    encodedValue,
                    info2,
                    img,
                    cssClass,
                    listName
                }
            })
            const groupData = { id: groupId, type: 'system' }
            this.addActions(actions, groupData)
        }

        /**
         * Build Treasures
         * @private
         * @param {string} groupId
         * @param {string} itemTypes
         */
        #buildTreasure(groupId, itemTypes) {
            const actionType = groupId
            const actions = Object.entries(this.actor.items.filter(
                el => itemTypes.includes(el.type) 
                && el.system.containerId == '' 
                && el.system.treasure)).map((item) => {
                if (item[1].system.melee) range = coreModule.api.Utils.i18n('OSE.items.Melee')
                else if (item[1].system.missile) range = coreModule.api.Utils.i18n('OSE.items.Missile')
                const abilityId = item[1].id
                const id = `${actionType}-${item[1].id}`
                const label = item[1].name
                const name = item[1].name
                const listName = `${actionType}${label}`
                const encodedValue = [actionType, abilityId].join(this.delimiter)
                const img = item[1].img
                const info2 = { text: item[1].system?.damage ? "(" + item[1].system.damage + ")" : "(" + item[1].system.quantity.value + ")", class: 'custominfo' }
                const cssClass = ''
                return {
                    id,
                    name,
                    encodedValue,
                    info2,
                    img,
                    cssClass,
                    listName
                }
            })
            const groupData = { id: groupId, type: 'system' }
            this.addActions(actions, groupData)
        }

        /**
         * Build Attributes
         * @private
         * @param {string} actionType
         * @param {string} groupId
         */
        #buildAttributes(actionType, groupId) {
             let actions = []
            const abilities = ['cha', 'con', 'dex', 'int', 'str', 'wis']
            actions = Object.entries(abilities).map((ability) => {
                const abilityId = ability[1]
                const id = `${actionType}-${ability[1]}`
                const label = coreModule.api.Utils.i18n(`OSE.scores.${abilityId}.long`)
                const name = coreModule.api.Utils.i18n(`OSE.scores.${abilityId}.long`)
                const listName = `${actionType}${label}`
                const encodedValue = [actionType, abilityId].join(this.delimiter)
                const info2 = { text: this.actor.system.scores[abilityId].value }
                const img = '/modules/token-action-hud-ose/styles/img/img_' + abilityId.toLocaleLowerCase() + '.png'
                const cssClass = ''
                return {
                    id,
                    name,
                    encodedValue,
                    info2,
                    img,
                    cssClass,
                    listName
                }
            })
            const groupData = { id: groupId, type: 'system' }
            this.addActions(actions, groupData)
        }

        /**
         * Build abilities
         * @private
         * @param {string} actionType
         * @param {string} groupId
         */
        #buildSaves(actionType, groupId) {
            const actions = Object.entries(this.actor.system.saves).map((ability) => {
                const abilityId = ability[0]
                const id = `${actionType}-${abilityId}`
                const label = coreModule.api.Utils.i18n(`OSE.saves.${abilityId}.long`)
                const name = coreModule.api.Utils.i18n(`OSE.saves.${abilityId}.long`)
                const img = '/systems/ose/assets/back.png'
                const listName = `${actionType}${label}`
                const encodedValue = [actionType, abilityId].join(this.delimiter)
                const info1 = { text: ability[1].value }
                return {
                    id,
                    name,
                    img,
                    encodedValue,
                    info1,
                    listName
                }
            })
            const groupData = { id: groupId, type: 'system' }
            this.addActions(actions, groupData)
        }

        #buildAbilities(actionType, groupId) {
            const abilities = this.actor.items.filter(el => el.type=='ability')
            const actions = []
            abilities.forEach((ability) => {
                if (ability.system.roll.length > 0) {
                    const abilityId = ability.id
                    const img = ability.img
                    const id = `${actionType}-${abilityId}`
                    const label = ability.name
                    const name = ability.name
                    const listName = `${actionType}${label}`
                    const encodedValue = [actionType, abilityId].join(this.delimiter)
                    const info1 = { text: ability.system.roll }
                    actions.push({
                        id,
                        name,
                        img,
                        encodedValue,
                        info1,
                        listName
                    })
                }
            })
            const groupData = { id: groupId, type: 'system' }
            this.addActions(actions, groupData)
        }

        #buildSpells() {
            const actionType = 'spell'
            if (this.actor.system.spells.enabled) {
                const spells = Object.entries(this.actor.system.spells.spellList)

                for (let i = 0; i < spells.length; i++) {
                    let level = spells[i][0]
                    if (level == 1) level = level + 'st'
                    else if (level == 2) level = level + 'nd'
                    else if (level == 3) level = level + 'rd'
                    else level = level + 'th'

                    const spellLevelList = Object.entries(spells[i][1]).map((ability) => {
                        const abilityId = ability[1].id
                        const id = `${actionType}-${ability[1].id}`
                        const label = ability[1].name
                        const name = ability[1].name
                        const listName = `${actionType}${label}`
                        const encodedValue = [actionType, abilityId].join(this.delimiter)
                        const info1 = { text: "( " + ability[1].system.cast + " )" }
                        const img = ability[1].img
                        const active = ability[1].system.cast > 0 ? ' active' : ''
                        const cssClass = `toggle${active}`
                        return {
                            id,
                            name,
                            encodedValue,
                            info1,
                            img,
                            cssClass,
                            listName
                        }
                    })
                    const groupData = { id: level + '-level-spells', type: 'system' }
                    this.addActions(spellLevelList, groupData)
                }
            }
        }

        #getActors() {
            const allowedTypes = ['character', 'npc']
            const actors = canvas.tokens.controlled.filter(
                token => token.actor).map((token) => token.actor)
            if (actors.every((actor) => allowedTypes.includes(actor.type))) {
                return actors
            } else {
                return []
            }
        }

        /**
         * Get tokens
         * @private
         * @returns {object}
         */
        #getTokens() {
            const allowedTypes = ['character', 'npc']
            const tokens = canvas.tokens.controlled
            const actors = tokens.filter(token => token.actor).map((token) => token.actor)
            if (actors.every((actor) => allowedTypes.includes(actor.type))) {
                return tokens
            } else {
                return []
            }
        }

    }
})