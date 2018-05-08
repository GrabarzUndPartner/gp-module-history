"use strict";

import browserHistory from 'exports-loader?History!historyjs/scripts/bundled-uncompressed/html5/native.history';
import AmpersandState from 'ampersand-state';
import Registry from './Registry';
import dataTypeDefinition from 'gp-module-base/dataTypeDefinition';

import uniq from 'lodash/uniq';
import unionBy from 'lodash/unionBy';

//https://www.npmjs.com/package/history-events

export default new(AmpersandState.extend(dataTypeDefinition, {
    session: {
        registry: {
            type: 'AmpersandCollection',
            required: true,
            default: function() {
                return new Registry();
            }
        },
        defaultTitle: {
            type: 'string',
            required: true,
            setOnce: true,
            default: function() {
                return document.title;
            }
        },
        defaultBaseName: {
            type: 'string',
            required: true,
            default: '?'
        }
    },

    initialize: function() {
        AmpersandState.prototype.initialize.apply(this, arguments);
        browserHistory.Adapter.bind(window, 'statechange', function() {
            this.registry.add(browserHistory.getState().data, {
                merge: true
            });
        }.bind(this), false);

        $(document).on('click', 'a[data-deep]', function(e) {
            e.preventDefault();
            var node = e.currentTarget;
            if (!!node.getAttribute('href').replace(/^#/, '')) {
                this.update([{
                    name: node.dataset.deep,
                    value: node.getAttribute('href').replace(/^#/, '') || null
                }], node.getAttribute('title') || null);
            } else {
                this.remove([node.dataset.deep]);
            }
        }.bind(this));

        var state = this.registry.toJSON();
        browserHistory.replaceState(state, getTitle.bind(this)(state), toQueryString(state, this.defaultBaseFilename));
    },

    register: function(name, callback) {
        var entry = this.registry.get(name);

        if (!entry) {
            entry = this.registry.add({
                name: name
            });
        }
        entry.callbacks.push(callback);
        callback(entry.value);
    },

    unregister: function(name) {
        var callbacks = this.registry.get(name).callbacks;
        callbacks.splice(callbacks.findIndex(function(callback) {
            if (callback.name === name) {
                return true;
            }
        }), 1);
        this.registry.get(name).callbacks = callbacks;
    },

    update: function(map, title) {
        var collection = updateSerializedCollection(this.registry.toJSON(), map);
        if (title) {
            browserHistory.pushState(collection, title, toQueryString(collection, this.defaultBaseName));
        } else {
            browserHistory.replaceState(collection, browserHistory.getState().title, toQueryString(collection, this.defaultBaseName));
        }
    },

    remove: function(keys) {
        this.update(keys.map(function(key) {
            return {
                name: key,
                value: null
            };
        }), this.defaultTitle);
    }
}))();

function getTitle(state) {
    var title = this.defaultTitle;
    state.forEach(function(item) {
        var node = $('[data-deep-name="' + item.name + '"][data-deep-value="' + item.value + '"][data-deep-title]');
        if (node.length) {
            title = node.data('deep-title');
        }
    });
    return title;
}

function updateSerializedCollection(collection, map) {
    return mergeCollections(collection, map, 'name');
}

function toQueryString(collection, defaultBaseName) {
    var result = collection.filter(function(item) {
        return item.value !== null;
    }).map(function(item) {
        return item.name + '=' + item.value;
    });
    if (result.length) {
        return '?' + result.join('&');
    } else {
        return location.pathname.split('/').slice(-1)[0] || defaultBaseName;
    }
}

function mergeCollections(collectionA, collectionB, by) {
    console.log('mergeCollections', collectionB, collectionA);
    return uniq(unionBy(collectionB, collectionA, by), false, by);
}
