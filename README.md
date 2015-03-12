# Hinet_SMS
Hinet telecom from Taiwan, sms api module.

## Install
	npm install hinet_sms

## Example

```
var sms = new SMS({
  account: 'HN_NUMBERS',
  password: 'SMS_PASSWORD'
});

sms.on('logined', function () {
  sms.send('0912333333', 'Test Message');
});

sms.connect(function () {
  sms.auth();
});
```

## Methods
The module defines the following functions:

### connect(callback)
Connect socket

### auth()
Get auth to CHT Server

### send(targetNumber, message)
Send a message to target number immediately.

## Events

* logined: when auth successful
* login_failed: auth failed
* sent: the message sent
