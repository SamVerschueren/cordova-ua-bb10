'use strict';

/**
 * This class represents the config file.
 *
 * @author Sam Verschueren      <sam.verschueren@gmail.com>
 * @since  2 Jun. 2015
 */

// module dependencies
var ConfigParser = require('./ConfigParser');

var Config = (function() {

    /**
     * Constructs a new config object.
     */
    function Config() {
        ConfigParser.parse('../config.xml', function(config) {
            this.config = config;
        }, this);
    }

    /**
     * This method returns the value of the preference associated with the name
     * provided.
     *
     * @param  {string} name  The name to retrieve the preference value for.
     * @return {string}       The preference associated with the name.
     */
    Config.prototype.getPreference = function(name) {
        return this.config.preferences[name];
    };

    return Config;
})();

// export the config
module.exports = new Config();
