'use strict';

/**
 * This class communicates with the server
 *
 * @author Sam Verschueren      <sam.verschueren@gmail.com>
 * @since  2 Jun. 2014
 */

// module dependencies
var config = require('./Config'),
    base64 = require('./Base64');

var PushNotification = (function() {

    /**
     * Constructs a new PushNotification object.
     */
    function PushNotification() {

    }

    /**
     * This method subscribe the device pin at Urban Airship.
     *
     * @param {Function} success Callback when everything went well
     * @param {Function} fail    Callback when something went wrong
     * @param {Object}   args    Arguments passed in from the JavaScript side
     * @param {Object}   env     The environment variable.
     */
    PushNotification.prototype.subscribe = function(success, fail, args, env) {
        var result = new PluginResult(args, env),
            request = new XMLHttpRequest();

        var inProduction = config.getPreference('com.urbanairship.in_production'),
            key = inProduction ? config.getPreference('com.urbanairship.production_app_key') : config.getPreference('com.urbanairship.development_app_key'),
            secret = inProduction ? config.getPreference('com.urbanairship.production_app_secret') : config.getPreference('com.urbanairship.development_app_secret');

        // Retrieve the token and create the basic authentication token
        var token = JSON.parse(decodeURIComponent(args[0])),
            auth = base64.encode(key + ':' + secret);

        // Set up the headers and the configuration
        request.open('PUT', 'https://go.urbanairship.com/api/device_pins/' + token, true);
        request.setRequestHeader('Authorization', 'Basic ' + auth);

        // Listen for changes
        request.onreadystatechange = function() {
            if(request.readyState === 4) {
                if(request.status === 200 || request.status === 201) {
                    // The request has been accepted
                    result.ok();
                }
                else {
                    // Womething went wrong
                    result.error({status: request.status, data: request.responseText});
                }
            }
        };

        // Send the request
        request.send();
    };

    /**
     * Unsubscribes the device at Urban Airship.
     *
     * @param {Function} success Callback when everything went well
     * @param {Function} fail    Callback when something went wrong
     * @param {Object}   args    Arguments passed in from the JavaScript side
     * @param {Object}   env     The environment variable.
     */
    PushNotification.prototype.unsubscribe = function(success, fail, args, env) {
        var result = new PluginResult(args, env),
            request = new XMLHttpRequest();

        var inProduction = config.getPreference('com.urbanairship.in_production'),
            key = inProduction ? config.getPreference('com.urbanairship.production_app_key') : config.getPreference('com.urbanairship.development_app_key'),
            secret = inProduction ? config.getPreference('com.urbanairship.production_app_secret') : config.getPreference('com.urbanairship.development_app_secret');

        // Retrieve the token and create the basic authentication token
        var token = JSON.parse(decodeURIComponent(args[0])),
            auth = base64.encode(key + ':' + secret);

        // Set up the headers and the configuration
        request.open('DELETE', 'https://go.urbanairship.com/api/device_pins/' + token, true);
        request.setRequestHeader('Authorization', 'Basic ' + auth);

        // Listen for changes
        request.onreadystatechange = function() {
            if(request.readyState === 4) {
                if(request.status === 204) {
                    // The request has been accepted
                    result.ok();
                }
                else {
                    // Something went wrong
                    result.error({status: request.status, data: request.responseText});
                }
            }
        };

        // Send the request
        request.send();
    };

    /**
     * Retrieves the push options from the config file and returns an object
     * that can be used to subscribe to blackberry's push service.
     *
     * @param {Function} success Callback when everything went well
     * @param {Function} fail    Callback when something went wrong
     * @param {Object}   args    Arguments passed in from the JavaScript side
     * @param {Object}   env     The environment variable.
     */
    PushNotification.prototype.getPushOptions = function(success, fail, args, env) {
        var result = new PluginResult(args, env);

        var cpid = config.getPreference('com.urbanairship.bb_cpid'),
            inProduction = config.getPreference('com.urbanairship.in_production');

        result.ok({
            appId: inProduction ? config.getPreference('com.urbanairship.production_bbapp_id') : config.getPreference('com.urbanairship.development_bbapp_id'),
            ppgUrl: inProduction ? 'http://cp' + cpid + '.pushapi.na.blackberry.com' : 'http://pushapi.eval.blackberry.com',
            invokeTargetId: config.getPreference('com.urbanairship.invoke_target_id')
        });
    };

    return PushNotification;
})();


// Export the module
module.exports = new PushNotification();
