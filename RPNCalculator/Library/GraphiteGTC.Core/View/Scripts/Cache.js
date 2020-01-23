/** 
 * @class Cache
 * @classdesc This is complete port of jQuery 3.0 data cache code to pure vanilla javascript
 * @category Core
 * @copyright Graphite GTC, LLC.
 * @author Graphite GTC, LLC. (info@graphitegtc.com)
 * @hideconstructor
 */
(function (Cache, window, document, Common, undefined) {

    // Private Variables
    var rnotwhite = (/\S+/g);
    var rmsPrefix = /^-ms-/;
    var rdashAlpha = /-([\da-z])/gi;
    var fcamelCase = function (all, letter) {

        return letter.toUpperCase();

    };

    // Private Methods
    function CamelCase (string) {

        return string.replace(rmsPrefix, 'ms-').replace(rdashAlpha, fcamelCase);

    };

    function AcceptData (owner) {

        // Accepts only:
        //  - Node
        //    - Node.ELEMENT_NODE
        //    - Node.DOCUMENT_NODE
        //  - Object
        //    - Any
        return owner && (owner.nodeType === 1 || owner.nodeType === 9 || !(+owner.nodeType));

    };

    // Data Cache Definition
    function Data () {

        this.CacheKey = 'GTCCache3.0' + Data.Guid++;

    };
    Data.Guid = 1;
    Data.Accepts = AcceptData;
    Data.prototype = {
        register: function (owner) {

            var value = {};

            // If it is a node unlikely to be stringify-ed or looped over use plain assignment
            if (owner.nodeType) {
                owner[this.CacheKey] = value;
            }
            else {
                // Otherwise secure it in a non-enumerable, non-writable property
                // configurability must be true to allow the property to be
                // deleted with the delete operator
                Object.defineProperty(owner, this.CacheKey, {
                    value: value,
                    writable: true,
                    configurable: true
                });
            }
            return owner[this.CacheKey];

        },
        cache: function (owner) {

            // We can accept data for non-element nodes in modern browsers, but we should not, see #8335.
            // Always return an empty object.
            if (!Data.Accepts(owner)) {
                return {};
            }

            // Check if the owner object already has a cache
            var cache = owner[this.CacheKey];

            // If so, return it
            if (cache) {
                return cache;
            }

            // If not, register one
            return this.register(owner);

        },
        set: function (owner, data, value) {

            var prop, cache = this.cache(owner);
            if (Common.IsString(data)) {
                cache[CamelCase(data)] = value;
            }
            else {
                // Copy the properties one-by-one to the cache object
                for (prop in data) {
                    cache[CamelCase(prop)] = data[prop];
                }
            }
            return cache;

        },
        get: function (owner, key) {

            var cache = this.cache(owner);
            return key === undefined ? cache : cache[CamelCase(key)];

        },
        access: function (owner, key, value) {

            // In cases where either:
            //
            //   1. No key was specified
            //   2. A string key was specified, but no value provided
            //
            // Take the 'read' path and allow the get method to determine
            // which value to return, respectively either:
            //
            //   1. The entire cache object
            //   2. The data stored at the key
            //
            if (key === undefined || ((key && Common.IsString(key)) && value === undefined)) {
                return this.get(owner, key);
            }

            // [*]When the key is not a string, or both a key and value
            // are specified, set or extend (existing objects) with either:
            //
            //   1. An object of properties
            //   2. A key and value
            //
            this.set(owner, key, value);

            // Since the 'set' path can have two possible entry points
            // return the expected data based on which path was taken[*]
            return value !== undefined ? value : key;

        },
        remove: function (owner, key) {

            var index, cache = owner[this.CacheKey];

            if (cache === undefined) {
                return;
            }

            if (key !== undefined) {

                // Support array or space separated string of keys
                if (Common.IsArray(key)) {
                    key = key.map(CamelCase);
                }
                else {
                    key = CamelCase(key);

                    // If a key with the spaces exists, use it.
                    // Otherwise, create an array by matching non-whitespace
                    key = key in cache ? [key] : (key.match(rnotwhite) || []);
                }

                index = key.length;

                while (index--) {
                    delete cache[key[index]];
                }
            }

            // Remove the cache key if there's no more data
            if (key === undefined || Common.IsEmptyObject(cache)) {
                delete owner[ this.CacheKey ];
            }

        },
        hasData: function (owner) {

            var cache = owner[this.CacheKey];
            return cache !== undefined && !Common.IsEmptyObject(cache);

        }
    };

    // Create new cache
    var DataCache = new Data();

    /**
     * @function Cache.Get
     * @param {object} element - A DOM element
     * @param {string} [key] - A Key
     * @description Gets a cached item
     * @returns {object} The cached item
     */
    Cache.Get = function (element, key) {

        return DataCache.get(element, key);

    };

    /**
     * @function Cache.Set
     * @param {object} element - A DOM element
     * @param {string} [key] - A Key
     * @param {object} value - The item to be cached
     * @description Caches an item
     * @returns {object} The cache of the element
     */
    Cache.Set = function (element, key, value) {

        return DataCache.set(element, key, value);

    };

    /**
     * @function Cache.Access
     * @param {object} element - A DOM element
     * @param {string} [key] - A Key
     * @param {object} [value] - The item to be cached
     * @description Caches an item<br>
                    In cases where either:<br>
                        &nbsp;&nbsp;1. No key was specified<br>
                        &nbsp;&nbsp;2. A string key was specified, but no value provided<br>
                    Take the 'read' path and allow the get method to determine<br>
                    which value to return, respectively either:<br>
                        &nbsp;&nbsp;1. The entire cache object<br>
                        &nbsp;&nbsp;2. The data stored at the key<br>
     * @returns {object} The cached value or the key
     */
    Cache.Access = function (element, key, value) {

        return DataCache.access(element, key, value);

    };

    /**
     * @function Cache.HasData
     * @param {object} element - A DOM element
     * @description Checks to see if the element has any cached data
     * @returns {boolean} <i>true</i> or <i>false</i> based on existence of cached data
     */
    Cache.HasData = function (element) {

        return DataCache.hasData(element);

    };

    /**
     * @function Cache.Remove
     * @param {object} element - A DOM element
     * @param {string} [key] - A Key
     * @description Removed a cached item or the cache of the element
     */
    Cache.Remove = function (element, key) {

        return DataCache.remove(element, key);

    };

    /**
     * @function Cache.CleanElementData
     * @param {object} element - A DOM element
     * @param {boolean} ignoreDelegatedData - If <i>true</i> then remove cache of the children
     * @description Called from Common.Remove among other places to cleanup data and events on elements
     * @todo Test performance
     */
    Cache.CleanElementData = function (elements, ignoreDelegatedData) {

        // Convert elements to an array, if necessary.
        if (!elements.length) {
            elements = [elements];
        }
        var data, element, type, index = 0;
        var eventInternal = Events.GetInternal();
        var special = eventInternal.special;

        // For each element destroy widgets, remove events and delete any remaining data
        for ( ; (element = elements[index]) !== undefined; index++) {
            if (AcceptData(element) && (data = element[DataCache.CacheKey])) {
                if (data.events) {
                    // Destroy widgets on elements
                    try {
                        // Only trigger remove when necessary to save time
                        if (data.events.remove) {
                            Events.TriggerHandler(element, 'remove');
                        }
                    } catch (e) {}

                    // Remove events
                    if (ignoreDelegatedData != true) {
                        CleanDelegatedElementData(element);
                    }
                    for (type in data.events) {
                        if (special[type]) {
                            eventInternal.remove(element, type);
                        }
                        else {
                            // Shortcut to avoid Events.event.remove's overhead
                            if (element.removeEventListener) {
                                element.removeEventListener(type, data.handle);
                            }
                        }
                    }
                }

                // Remove data
                delete element[DataCache.CacheKey];
            }
        }

    };

    /**
     * @function Cache.CleanDelegatedElementsData
     * @param {object} element - A DOM element
     * @param {boolean} onlyChildren - If <i>true</i> then remove cache of the only the children otherwise included element also
     * @description Use this function to only remove delegated events from an element and all its children
                    Useful when you need to leave an element in the DOM for replacement while the replacement element
                    is being built with delegated events. Using this function you can remove delegated events, insert new element
                    then when you call Remove on the old element pass true to ignore delegated events on removal.
     */
    Cache.CleanDelegatedElementsData = function (element, onlyChildren) {

        if (element.nodeType === 1) {
            // Get all elements inside element to be removed and clean up their data and events as well
            // INFO: getElementsByTagName is MUCH faster in this context than querySelectorAll (NodeList - live vs static)
            var childElements = element.getElementsByTagName('*');

            // Merge top element back in for clean up
            if (onlyChildren != true) {
                childElements = Common.MergeArray([element], childElements);
            }

            // For each element remove delegated events
            var element, index = 0;
            for ( ; (element = childElements[index]) !== undefined; index++) {
                CleanDelegatedElementData(element);
            }
        }

    };

    // Private Methods
    function CleanDelegatedElementData (element) {

        var id = element.id;
        if (Common.IsDefined(id) && Common.IsNotEmptyString(id)) {
            id = '.' + id;
            Events.Off(document.body, id);
            Events.Off(document, id);
            Events.Off(window, id);
        }

    };

} (window.Cache = window.Cache || {}, window, document, Common));
