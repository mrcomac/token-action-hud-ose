export let ActionHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    ActionHandler = class ActionHandler extends coreModule.api.ActionHandler {

        /**
         * Build System Actions
         * @override
         * @param {array} groupIds
         * @returns {object}
         */
        async buildSystemActions (groupIds) {
            // Set actor and token variables
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
         async #buildCharacterActions () {
            this.#buildAbilities('ability', 'abilities')
            this.#buildAbilities('save', 'saves')
            this.#buildSpells()
            this.#buildItems()
        }

        #buildItems() {
            this.#buildInventoryContainer()
            this.#buildInventory('armor', ['armor'])
            this.#buildInventory('weapon', ['weapon'])
            this.#buildInventory('misc', ['item'])
            
            // weapon
            // inventory
            //this.actor.items.filter(el => el.type == 'weapon')

        }
        async #buildInventoryContainer() {
            //console.log("CONTA?INER")
            const itemTypes = 'container'
            const parentgroupData = { id: 'inventory', type: 'custom' }

            
            //const weapons = this.actor.items.filter(el => el.type == itemType )

            for( const [_,container] of Object.entries(this.actor.items.filter(el =>  itemTypes.includes(el.type) && el.system.itemIds.length > 0))) {
                console.log("CONTAINER",container)
                const groupDataClone = { id: `container_${container.id}`, name: container.name, type: 'list' }
                await this.addGroup(groupDataClone, parentgroupData, true)
                this.#buildContainer(container.system.itemIds, groupDataClone)
            }
        }

        #buildContainer(items, groupData) {
            console.log("ITEM IN CONTAINER",items)
            let actions = []
            for(const itemId of items) {
                console.log(itemId)
                const item = this.actor.items.get(itemId)
                const actionType = item.type
                const abilityId = item.id
                const id = `${actionType}-${item.id}`
                //const abbreviatedName = coreModule.api.Utils.i18n(`OSE.scores.${abilityId}.short`)
                const label = item.name
                const name = item.name
                const listName = `${actionType}${label}`
                const encodedValue = [actionType, abilityId].join(this.delimiter)
                //const info2 = { text: this.actor.system.scores[abilityId].value }
                const img = item.img
                //const icon1 = '<img class="tah-image-custom" src="../../systems/ose/assets/melee.png" />' 
                //const info1 = {text: range }
                const info2 = {text: item.system?.damage ? "("+item[1].system.damage+")" : "("+item.system.quantity.value+")", class: 'custominfo' }
                //const info3 = {text: 'Two-Handed' }
                const cssClass = ''
                actions.push({
                    id,
                    name,
                    encodedValue,
                    //info1,
                    info2,
                    //info3,
                    img,
                    // icon1,
                    cssClass,
                    listName
                })
            }
            // Add actions to action list
            this.addActions(actions, groupData)
            console.log(this.groups)
        }

        #buildInventory(groupId, itemTypes) {
            console.log("ITEMS")
            const actionType = groupId
            //const weapons = this.actor.items.filter(el => el.type == itemType )

            const actions = Object.entries(this.actor.items.filter(el =>  itemTypes.includes(el.type) && el.system.containerId == '')).map((item) =>{
                console.log("ITEM",item)
                let range = ''
                if(item[1].system.melee) range = coreModule.api.Utils.i18n('OSE.items.Melee')
                else if(item[1].system.missile) range = coreModule.api.Utils.i18n('OSE.items.Missile')
                const abilityId = item[1].id
                const id = `${actionType}-${item[1].id}`
                //const abbreviatedName = coreModule.api.Utils.i18n(`OSE.scores.${abilityId}.short`)
                const label = item[1].name
                const name = item[1].name
                const listName = `${actionType}${label}`
                const encodedValue = [actionType, abilityId].join(this.delimiter)
                //const info2 = { text: this.actor.system.scores[abilityId].value }
                const img = item[1].img
                //const icon1 = '<img class="tah-image-custom" src="../../systems/ose/assets/melee.png" />' 
                //const info1 = {text: range }
                const info2 = {text: item[1].system?.damage ? "("+item[1].system.damage+")" : "("+item[1].system.quantity.value+")", class: 'custominfo' }
                //const info3 = {text: 'Two-Handed' }
                const cssClass = ''
                return {
                    id,
                    name,
                    encodedValue,
                    //info1,
                    info2,
                    //info3,
                    img,
                    // icon1,
                    cssClass,
                    listName
                }
            })

            const groupData = { id: groupId, type: 'system' }
            // Add actions to action list
            this.addActions(actions, groupData)
        }

          /**
         * Build abilities
         * @private
         * @param {string} actionType
         * @param {string} groupId
         */
        #buildAbilities (actionType, groupId) {
            // Get abilities
            let actions = []
            if(groupId == 'abilities' && this.actor.type == 'character') {
                const abilities = ['cha', 'con', 'dex', 'int', 'str', 'wis']
                actions = Object.entries(abilities).map((ability) => {
                    const abilityId = ability[1]
                    const id = `${actionType}-${ability[1]}`
                    const abbreviatedName = coreModule.api.Utils.i18n(`OSE.scores.${abilityId}.short`)
                    const label = coreModule.api.Utils.i18n(`OSE.scores.${abilityId}.long`)
                    const name = coreModule.api.Utils.i18n(`OSE.scores.${abilityId}.long`)
                    const listName = `${actionType}${label}`
                    const encodedValue = [actionType, abilityId].join(this.delimiter)
                    const info2 = { text: this.actor.system.scores[abilityId].value }
                    const img = '/modules/token-action-hud-ose/styles/img/img_'+abilityId.toLocaleLowerCase()+'.png'
                    //const icon1 = '<i class="fas fa-dice-d8"></i>'
                    const cssClass = ''
                    return {
                            id,
                            name,
                            encodedValue,
                            info2,
                            img,
                            //icon1,
                            cssClass,
                            listName
                    }
                })

            // Create group data
            } else if(groupId == 'saves') {
                //const saves = Object.entries(token.actor.system.saves)
                actions = Object.entries(this.actor.system.saves).map((ability) => {
                    const abilityId = ability[0]
                    const id = `${actionType}-${ability[0]}`
                    const abbreviatedName = coreModule.api.Utils.i18n(`OSE.saves.${abilityId}.long`)
                    const label = coreModule.api.Utils.i18n(`OSE.saves.${abilityId}.long`)
                    const name = coreModule.api.Utils.i18n(`OSE.saves.${abilityId}.long`)
                    const listName = `${actionType}${label}`
                    const encodedValue = [actionType, abilityId].join(this.delimiter)
                    const info1 = { text: ability[1].value }
                    //const icon1 = (groupId !== 'checks') ? this.#getProficiencyIcon(abilities[abilityId].proficient) : ''
                    return {
                            id,
                            name,
                            encodedValue,
                            info1,
                            // icon1,
                            listName
                    }
                })

            }
            const groupData = { id: groupId, type: 'system' }
            // Add actions to action list
            this.addActions(actions, groupData)
        }

        #buildSpells () {
            const actionType = 'spell'
            if(this.actor.system.spells.enabled) {
                const spells  = Object.entries(this.actor.system.spells.spellList)

                for(let i = 0; i < spells.length; i++) {
                    let level = spells[i][0]
                    if(level == 1) level = level+'st'
                    else if(level == 2) level = level+'nd'
                    else if(level == 3) level = level+'rd'
                    else level = level+'th'

                    const spellLevelList = Object.entries(spells[i][1]).map((ability) => {
                        const abilityId = ability[1].id
                        const id = `${actionType}-${ability[1].id}`
                        const abbreviatedName = ability[1].name
                        const label = ability[1].name
                        const name = ability[1].name
                        const listName = `${actionType}${label}`
                        const encodedValue = [actionType, abilityId].join(this.delimiter)
                        const info1 = { text: "( "+ability[1].system.cast+" )" }
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
                const groupData = { id: level+'-level-spells', type: 'system' }
                console.log(groupData)
                // Add actions to action list
                this.addActions(spellLevelList, groupData)   
                }

            }
        }

        #getActors () {
            const allowedTypes = ['character', 'npc']
            const actors = canvas.tokens.controlled.filter(token => token.actor).map((token) => token.actor)
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
        #getTokens () {
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