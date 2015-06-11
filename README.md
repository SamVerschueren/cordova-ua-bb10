# cordova-ua-bb10

> BlackBerry 10 push plugin for [Urban Airship](http://urbanairship.com/).

## Example

Only call these methods when the cordova `deviceready` event is fired.

```JavaScript
UAirship.getLaunchNotification(function(payload) {
    // Executed when the user opens the app via the notification
});

// Test if the user notifications are enabled
UAirship.isUserNotificationsEnabled(function(enabled) {
    if(!enabled) {
        // Subscribe
        UAirship.setUserNotificationsEnabled(true, function(err) {
            if(err) {
                // Handle the error
                return;
            }
        });
    }
});
```

When the application is open, you can listen for the incoming push notification.

```JavaScript
document.addEventListener('urbanairship.push', function(ev) {
    // Handle the incoming push
    
    console.log(ev.message);
}, false);
```

## Configuration

The following tags should be added to your `config.xml` file.

```xml
<!-- Global Urban Airship configuration -->
<preference name="com.urbanairship.production_app_key" value="Your Production App Key" />
<preference name="com.urbanairship.production_app_secret" value="Your Production App Secret" />
<preference name="com.urbanairship.development_app_key" value="Your Development App Key" />
<preference name="com.urbanairship.development_app_secret" value="Your Development App Secret" />
<preference name="com.urbanairship.in_production" value="true | false" />

<!-- BlackBerry specific configuration -->
<preference name="com.urbanairship.production_bbapp_id" value="Your Production BlackBerry App ID" />
<preference name="com.urbanairship.development_bbapp_id" value="Your Development BlackBerry App ID" />
<preference name="com.urbanairship.bb_cpid" value="Your BlackBerry Content Provider ID" />
<preference name="com.urbanairship.invoke_target_id" value="The Invoke Target Push ID" />

<!-- Extra target ID's -->
<rim:invoke-target id="The Invoke Target Push ID">
    <type>APPLICATION</type>
    <filter>
        <action>bb.action.PUSH</action>
        <mime-type>application/vnd.push</mime-type>
    </filter>
</rim:invoke-target>

<rim:invoke-target id="The Invoke Target Open ID">
    <type>APPLICATION</type>
    <filter>
        <action>bb.action.OPEN</action>
        <mime-type>text/plain</mime-type>
    </filter>
</rim:invoke-target>
```

#### com.urbanairship.production_bbapp_id

The production Application ID received in the email from BlackBerry. If `com.urbanairship.in_production` is set to `true`, this ID
will be used to register the device.

#### com.urbanairship.development_bbapp_id

The development Application ID received in the email from BlackBerry. If `com.urbanairship.in_production` is set to `false`, this ID
will be used to register the device.

#### com.urbanairship.bb_cpid

The BlackBerry Content Provider ID can be found in the email received from BlackBerry. Use the production CPID number because this is
not used when registering for development.

#### com.urbanairship.invoke_target_id

This property should be unique in BlackBerry World. An example could be `com.company.appname.push`.

#### rim:invoke-target

The first invoke target ID should be identical to the `com.urbanairship.invoke_target_id` value. For example the `com.company.appname.push` value.

The second invoke target ID is used to know what should happen when the user taps the notification, in this case it will open the application. Good practice
is to use the same as the other invoke target ID but instead of push, use open. For example, this could be `com.company.appname.open`.

## API

### isUserNotificationsEnabled(fn)

#### fn

*Required*  
Type: `function`

The callback function that will be called with a boolean parameter indicating if the user notifications are enabled or not.

### setUserNotificationsEnabled(enabled [, fn])

#### enabled

*Required*  
Type: `boolean`

Set to `true` if you want to enable the push notifications, `false` if you want to disable the push notifications.

#### fn

Type: `function`

The callback function. The first parameter is the error object if an error occurred, or `undefined` if no error occurred. The second
parameter is the device token when enabling the user notifications. When disabling the user notifications, nothing is provided as
second parameter.

### getLaunchNotification(fn)

#### fn

*Required*  
Type: `function`

This function will be called when the application is opened via the push notification. The parameter of the function is the push
object send from the UrbanAirship servers.

## Events

### urbanairship.push

This event will be fired when a push notification comes in and the application is open. The first parameter in the listener
is the event object which will also hold all the properties of the push object.

## Author

- Sam Verschueren [<sam.verschueren@gmail.com>]

## License

MIT © Sam Verschueren
