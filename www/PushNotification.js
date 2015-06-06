'use strict';

var exec = require('cordova/exec'),
    base64 = require('./Base64');

/**
 * This class is used to interact with the core.
 *
 * @author Sam Verschueren		<sam.verschueren@gmail.com>
 * @since  2 Jun. 2014
 */
var PushNotification = (function() {

    /**
     * Creates a new push notification object.
     */
    function PushNotification() {
        var self = this;

        this._pushOptions = {};
        this._pushService = undefined;
        this._pushCallback = undefined;
        this._hasBeenInForeground = false;

        this._initialize = function(callback) {
            if(window.blackberry.app.windowState == 'fullscreen') {
                // If the window is fullscreen, the app is in the foreground and we should not close it on push received
                self._hasBeenInForeground = true;
            }

            // Listen for the resume action
            document.addEventListener('resume', self._onResume);

            if(self._pushService) {
                return callback(self._pushService);
            }

            // Create a new PushService object
            window.blackberry.push.PushService.create(self._pushOptions, onSuccess, onError, onSimChanged, onPushTransportReady);

            function onSuccess(service) {
                self._pushService = service;
                callback(service);
            }

            function onError(result) {
                if (result == window.blackberry.push.PushService.INTERNAL_ERROR) {
                    window.alert("Error: An internal error occurred while calling blackberry.push.PushService.create. Try restarting the application.");
                }
                else if (result == window.blackberry.push.PushService.INVALID_PROVIDER_APPLICATION_ID) {
                    // This error only applies to consumer applications that use a public/BIS PPG
                    window.alert("Error: Called blackberry.push.PushService.create with a missing or invalid appId value. It usually means a programming error.");
                }
                else if (result == window.blackberry.push.PushService.MISSING_INVOKE_TARGET_ID) {
                    window.alert("Error: Called blackberry.push.PushService.create with a missing invokeTargetId value. It usually means a programming error.");
                }
                else if (result == window.blackberry.push.PushService.SESSION_ALREADY_EXISTS) {
                    window.alert("Error: Called blackberry.push.PushService.create with an appId or invokeTargetId value that matches another application. It usually means a programming error.");
                }
                else {
                    window.alert("Error: Received error code (" + result + ") after calling blackberry.push.PushService.create.");
                }
            }

            function onSimChanged() { }

            function onPushTransportReady() { }
        };

        this._onInvoke = function(invokeRequest) {
            console.log('Invoked');
            console.log(invokeRequest.action);
            
            if(invokeRequest.action !== null && invokeRequest.action == 'bb.action.PUSH') {
                // Extract the payload out of the request
                self._retrievePayload(invokeRequest, function(payload) {
                    var title = window.blackberry.app.name;
                    var options = {
                        body: payload.message,
                        payload: base64.encode(JSON.stringify(payload))
                    };

                    // Create a new notification in the hub with a title and some other options.
                    new Notification(title, options);

                    // If the application has not been in the foreground yet, it means it launched on push received
                    // and we should close it again.
                    if(!self._hasBeenInForeground) {
                        // Exit the application.
                        self._exitApplication();
                    }
                });
            }
            else if(invokeRequest.action !== null && invokeRequest.action == 'bb.action.OPEN') {
                // Create a `urbanairship.push` event with the extra data of the message
                var e = new CustomEvent('urbanairship.push', JSON.parse(base64.decode(invokeRequest.data)));

                // Dispatch the event
                document.dispatchEvent(e);
            }
        };

        this._loadPushOptions = function() {
            exec(success, function() {}, 'PushNotification', 'getPushOptions', []);

            function success(data) {
                self._pushOptions = data;
            }
        };

        this._retrievePayload = function(invokeRequest, callback) {
            // Extract the push payload
            var payload = self._pushService.extractPushPayload(invokeRequest);

            if(payload.isAcknowledgeRequired) {
                // If an acknowledgement to the server is required, acknowledge the push.
                payload.acknowledge(true);
            }

            // Create a new reader object to transform an ArrayBuffer to a string.
            var reader = new FileReader();

            // Subscribe to the onload event that is fired when the reader is ready.
            reader.onload = function(evt) {
                var data;

                try {
                    data = JSON.parse(evt.target.result);
                }
                catch(e) {
                    data = {message: evt.target.result};
                }

                // Trigger the callback and return the payload object.
                callback(data);
            };

            // Start reading the payload data as utf8
            reader.readAsText(payload.data, 'UTF-8');
        };

        this._onResume = function() {
            self._hasBeenInForeground = true;
        };

        this._exitApplication = function() {
            setTimeout(function() {
                // Check again that the application has not been
                // brought to the foreground in the second before
                // we exit
                if (!self._hasBeenInForeground) {
                    window.blackberry.app.exit();
                }
            }, 1000);
        };

        this._loadPushOptions();
    }

    /**
     * Checks if user notifications are enabled or not.
     *
     * @param {Function} callback The function to call on completion.
     */
    PushNotification.prototype.isUserNotificationsEnabled = function(callback) {
        // If the pushService is not undefined, it is enabled
        callback(this._pushService !== undefined);
    };

    /**
     * Subscribes the user at the API endpoint.
     *
     * @param Function  callback Function that will be fired on return.
     */
    PushNotification.prototype.subscribe = function(callback) {
        var self = this;

        this._initialize(function(service) {
            // Subscribe to the invoked listener if the channel was created succesfully
            blackberry.event.addEventListener('invoked', self._onInvoke);
            
            if(window.localStorage.getItem('be.samverschueren.push.bb_token')) {
                // If the token is already persisted in the localstorage, we don't need to create a new channel
                return tokenReceived(window.localStorage.getItem('be.samverschueren.push.bb_token'));
            }

            // Create a new channel if the token was not yet retrieved
            service.createChannel(function(result, token) {
                if(result === window.blackberry.push.PushService.SUCCESS) {
                    // Make sure the application launches on push
                    service.launchApplicationOnPush(true);

                    tokenReceived(token);
                }
            });
        });

        function tokenReceived(token) {
            // Store token in the local storage
            window.localStorage.setItem('be.samverschueren.push.bb_token', token);

            // Register the token
            cordova.exec(success, error, 'PushNotification', 'subscribe', [token]);
        }

        function success() {
            if(callback) callback(undefined, window.localStorage.getItem('be.samverschueren.push.bb_token'));
        }

        function error(err) {
            if(callback) callback(err);
        }
    };

    /**
     * Unsubscribes the user at the API endpoint.
     *
     * @param Function  callback Function that will be fired on return.
     */
    PushNotification.prototype.unsubscribe = function(callback) {
        var token = window.localStorage.getItem('be.samverschueren.push.bb_token');

        cordova.exec(success, error, 'PushNotification', 'unsubscribe', [token]);

        this._initialize(function(service) {
            service.destroyChannel(function(result) {
                if(result === window.blackberry.push.PushService.SUCCESS) {
                    window.localStorage.removeItem('be.samverschueren.push.bb_token');
                }
                else {
                    console.error(result);
                }
            });
        });

        function success(data) {
            if(callback) callback(undefined, data);
        }

        function error(err) {
            if(callback) callback(err);
        }
    };

    return PushNotification;
})();

// Export the plugin
module.exports = new PushNotification();
