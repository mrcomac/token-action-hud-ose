export let oseRollHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    oseRollHandler = class OSERollHandler extends coreModule.api.RollHandler {
    /**
     * Handle Action Event
     * @override
     * @param {object} event
     * @param {string} encodedValue
     */
        async handleActionClick (event, encodedValue) {
            const payload = encodedValue.split('|')
            if (payload.length !== 2) {
                super.throwInvalidValueErr()
            }

            const actionType = payload[0]
            const actionId = payload[1]

            if (!this.actor) {
                for (const token of canvas.tokens.controlled) {
                    const actor = token.actor
                    await this.#handleAction(event, actionType, actor, token, actionId)
                }
            } else {
                await this.#handleAction(event, actionType, this.actor, this.token, actionId)
            }
        }

        /**
         * Handle action
         * @private
         * @param {object} event
         * @param {string} actionType
         * @param {object} actor
         * @param {object} token
         * @param {string} actionId
         */
        async #handleAction (event, actionType, actor, token, actionId) {
            switch (actionType) {
            case 'ability':
                this.#rollAbility(event, actor, actionId)
                break;
            case 'attribute':
                this.#rollAttribute(event, actor, actionId)
                break
            case 'check':
                this.#rollAbilityTest(event, actor, actionId)
                break
            case 'save':
                this.#rollAbilitySave(event, actor, actionId)
                break
            case 'condition':
                if (!token) return
                await this.#toggleCondition(event, actor, token, actionId)
                break
            case 'effect':
                await this.#toggleEffect(event, actor, actionId)
                break
            case 'feature':
            case 'spell':
            case 'weapon':
                if (this.isRenderItem()) this.doRenderItem(actor, actionId)
                else {
                    this.#useItem(event, actor, actionId, true)
                }
                break;
            case 'item':
            case 'misc':
                if (this.isRenderItem()) this.doRenderItem(actor, actionId)
                else {
                    new Dialog({
                        title: coreModule.api.Utils.i18n('tokenActionHud.ose.consume_dialog.title'),
                        content: `${coreModule.api.Utils.i18n('tokenActionHud.ose.consume_dialog.content')}<br /><input id="quantityID" type="number" value="1" />`,
                        buttons: {
                          button1: {
                            label: "Yes",
                            callback: (html) => {this.#useItem(event, actor, actionId, true, html.find("input#quantityID").val())},
                            icon: `<i class="fas fa-check"></i>`
                          },
                          button2: {
                            label: "No",
                            callback: () => {this.#useItem(event, actor, actionId, false)},
                            icon: `<i class="fas fa-times"></i>`
                          }
                        }
                      }).render(true);
                    
                }
                break
            case 'magicItem':
                this.#rollMagicItem(actor, actionId)
                break
            case 'skill':
                this.#rollSkill(event, actor, actionId)
                break
            case 'utility':
                await this.#performUtilityAction(event, actor, token, actionId)
                break
            default:
                break
            }
        }

        /**
         * Roll Attribute
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        #rollAttribute (event, actor, actionId) {
            if (!actor) return
            if (!actor.system?.abilities) return
            actor.rollCheck(actionId, { event })
        }

        /**
         * Roll Ability
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        #rollAbility (event, actor, actionId) {
            if (!actor) return
            //if (!actor.system?.abilities) return
            const abilitites = actor.items.filter(el => el.type=='ability')
            abilitites.forEach((ability) => {
                if(ability.id == actionId) {
                    ability.roll()
                }
            })
        }

        /**
         * Roll Ability Save
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        #rollAbilitySave (event, actor, actionId) {
            if (!actor) return
            if (!actor.system?.abilities) return
            actor.rollSave(actionId, { event })
        }

        /**
         * Roll Ability Test
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        #rollAbilityTest (event, actor, actionId) {
            if (!actor) return
            if (!actor.system?.abilities) return
            actor.rollAbilityTest(actionId, { event })
        }

        /**
         * Roll Magic Item
         * @private
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        #rollMagicItem (actor, actionId) {
            const actionParts = actionId.split('>')
            const itemId = actionParts[0]
            const magicEffectId = actionParts[1]
            const magicItemActor = MagicItems.actor(actor.id)
            magicItemActor.roll(itemId, magicEffectId)
            Hooks.callAll('forceUpdateTokenActionHud')
        }

        /**
         * Roll Skill
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        #rollSkill (event, actor, actionId) {
            if (!actor) return
            if (!actor.system?.skills) return
            actor.rollSkill(actionId, { event })
        }

        /**
         * Use Item
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         * @returns {object}        The item
         */
        #useItem (event, actor, actionId, consumeItem, quantity=0) {
            const item = coreModule.api.Utils.getItem(actor, actionId)

            if (this.#needsRecharge(item)) {
                item.rollRecharge()
                return
            }
            if(item.type == 'spell') {
                if(item.system.cast > 0 && consumeItem) {
                    return item.spendSpell()
                }
            } else if(item.type == 'weapon') {
                return item.rollWeapon()

            } else if(item.system.quantity.value > 0 && consumeItem){
                const newData = {
                    quantity: {
                        value: item.system.quantity.value-quantity
                    }
                  }
                  item.show()
                  return item.update({ system: newData });
            }
            return
        }

        /**
         * Needs Recharge
         * @private
         * @param {object} item
         * @returns {boolean}
         */
        #needsRecharge (item) {
            return (
                item.system.recharge &&
                !item.system.recharge.charged &&
                item.system.recharge.value
            )
        }

        /**
         * Perform utility action
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {object} token    The token
         * @param {string} actionId The action id
         */
        async #performUtilityAction (event, actor, token, actionId) {
            switch (actionId) {
            case 'deathSave':
                actor.rollDeathSave({ event })
                break
            case 'endTurn':
                if (!token) break
                if (game.combat?.current?.tokenId === token.id) {
                    await game.combat?.nextTurn()
                }
                break
            case 'initiative':
                await this.#rollInitiative(actor)
                break
            case 'inspiration': {
                const update = !actor.system.attributes.inspiration
                actor.update({ 'data.attributes.inspiration': update })
                break
            }
            case 'longRest':
                actor.longRest()
                break
            case 'shortRest':
                actor.shortRest()
                break
            }

            // Update HUD
            Hooks.callAll('forceUpdateTokenActionHud')
        }

        /**
         * Roll Initiative
         * @param {object} actor The actor
         * @private
         */
        async #rollInitiative (actor) {
            if (!actor) return
            await actor.rollInitiative({ createCombatants: true })

            Hooks.callAll('forceUpdateTokenActionHud')
        }

        /**
         * Toggle Condition
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {object} token    The token
         * @param {string} actionId The action id
         */
        async #toggleCondition (event, actor, token, actionId) {
            if (!token) return

            const isRightClick = this.isRightClick(event)
            const statusEffect = CONFIG.statusEffects.find(statusEffect => statusEffect.id === actionId)
            const isConvenient = (statusEffect?.flags)
                ? Object.hasOwn(statusEffect.flags, 'dfreds-convenient-effects')
                    ? statusEffect.flags['dfreds-convenient-effects'].isConvenient
                    : null
                : null ??
                actionId.startsWith('Convenient Effect')

            if (game.dfreds && isConvenient) {
                isRightClick
                    ? await game.dfreds.effectInterface.toggleEffect(statusEffect.name ?? statusEffect.label, { overlay: true })
                    : await game.dfreds.effectInterface.toggleEffect(statusEffect.name ?? statusEffect.label)
            } else {
                const condition = this.#findCondition(actionId)
                if (!condition) return
                const effect = this.#findEffect(actor, actionId)
                if (effect?.disabled) { await effect.delete() }

                isRightClick
                    ? await token.toggleEffect(condition, { overlay: true })
                    : await token.toggleEffect(condition)
            }

            Hooks.callAll('forceUpdateTokenActionHud')
        }

        /**
         * Find condition
         * @private
         * @param {string} actionId The action id
         * @returns {object}        The condition
         */
        #findCondition (actionId) {
            return CONFIG.statusEffects.find((effect) => effect.id === actionId)
        }

        /**
         * Find effect
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         * @returns {object}        The effect
         */
        #findEffect (actor, actionId) {
            if (game.version.startsWith('11')) {
                return actor.effects.find(effect => effect.statuses.every(status => status === actionId))
            } else {
                // V10
                return actor.effects.find(effect => effect.flags?.core?.statusId === actionId)
            }
        }

        /**
         * Toggle Effect
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #toggleEffect (event, actor, actionId) {
            const effects = 'find' in actor.effects.entries ? actor.effects.entries : actor.effects
            const effect = effects.find(effect => effect.id === actionId)

            if (!effect) return

            const isRightClick = this.isRightClick(event)

            if (isRightClick) {
                await effect.delete()
            } else {
                await effect.update({ disabled: !effect.disabled })
            }

            Hooks.callAll('forceUpdateTokenActionHud')
        }
    }
})