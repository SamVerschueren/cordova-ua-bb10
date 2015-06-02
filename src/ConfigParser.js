'use strict';

/**
 * This parser knows how to parse xml config data from cordova. It only parses the
 * preferences because all the other data like description and author can be
 * retrieved form config in the cordova framework.
 *
 * @author Sam Verschueren      <sam.verschueren@gmail.com>
 * @since  2 Jun. 2014
 */

/**
 * This method parses the xml file and returns it as JSON object via the callback.
 *
 * @param {string}      xmlPath     Path to the xml file that should be parsed.
 * @param {Function}    callback    The callback function that should be called when done reading the xml file.
 * @param {Object}      ctx         The optional context that should be passed to the callback.
 */
exports.parse = function(xmlPath, callback, ctx) {
    var config = {
        preferences: {}
    };

    // Default the context to this
    ctx = ctx || this;

    // Create an XHR request
    var xhr = new XMLHttpRequest();

    // Listen to the onReadyStateChange event
    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4) {
            if(xhr.status == 200) {
                var parser = xhr.responseXML;

                // Get all the preferences
                var preferences = parser.getElementsByTagName('preference');

                // Iterate over the preferences and insert them in the config object
                for(var i=0; i<preferences.length; i++) {
                    var name = preferences[i].getAttribute('name');
                    var value = preferences[i].getAttribute('value');

                    config.preferences[name] = value;
                }

                callback.call(ctx, config);
            }
            else {
                // Something went wrong, just send the empty config back
                callback.call(ctx, config);
            }
        }
    };

    // Open the xml file
    xhr.open('GET', xmlPath, true);
    xhr.send();
};
