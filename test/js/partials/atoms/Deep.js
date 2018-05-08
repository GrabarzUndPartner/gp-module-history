'use strict';

import Controller from 'gp-module-base/Controller';
import DomModel from 'gp-module-base/DomModel';


import history from '../../../../src/default';

export default Controller.extend({


    modelConstructor: DomModel.extend({
        session: {
            deepName: {
                type: 'string',
                required: true
            },
            deepValue: {
                type: 'string',
                required: true
            },
            active: {
                type: 'boolean',
                required: true
            },
            value: {
                type: 'string',
                required: true
            }
        }
    }),

    bindings: {
        'model.active': {
            type: 'booleanClass',
            name: 'js--active'
        },
        'model.value': {
            type: 'innerHTML',
            hook: 'deepContentValue'
        }
    },


    events: {

'click [data-hook="resetHistoryButton"]': onClickResetHistoryButton,

        'click [data-hook="replaceStateButton"]': onClickReplaceStateButton,
        'click [data-hook="addStateButton"]': onClickAddStateButton,
        'click [data-hook="removeStateButton"]': onClickRemoveStateButton,
        'click [data-hook="removeByValueWithTitleStateButton"]': onClickRemoveByValueWithTitleStateButton

    },

    initialize() {
        Controller.prototype.initialize.apply(this, arguments);
        history.register(this.model.deepName, this.onChangeDeep.bind(this));
        log('INIT');
    },

    onChangeDeep(value) {
        log('CHANGE DEEP VALUE', value, this.model.value, value);
        if (this.model.deepValue === value) {
            this.model.active = true;
        } else {
            this.model.active = false;
        }
    },

    hasTitle() {
        return this.queryByHook('withTitleCheckbox').checked;
    }

});

function onClickResetHistoryButton() {
    global.history.go(-global.history.length); // Return at the beginning
    global.location.replace("index.html");
}

function onClickReplaceStateButton() {

}

function onClickAddStateButton() {

}

function onClickRemoveStateButton() {
    history.remove([this.model.deepName]);
}

function onClickRemoveByValueWithTitleStateButton() {
    history.update([{
        name: this.model.deepName,
        value: null
    }], this.hasTitle() ? 'Test Title' : null);
}

function log() {
    console.log.apply(this, ['HISTORY LOG:'].concat(Array.from(arguments)));
}
