'use strict';

var net = require('net'),
    util = require('util'),
    bufferpack = require('bufferpack'),
    EventEmitter = require('events').EventEmitter;


var SMS = function SMS (options) {
  options = options || {};

  this.account = options.account || process.env.CHT_SMS_ACCOUNT;
  this.password = options.password || process.env.CHT_SMS_PASSWORD;

  this.status = this.INITED;

  this.client = new net.Socket();
};

util.inherits(SMS, EventEmitter);

SMS.prototype.INITED = 0;
SMS.prototype.CONNECTED = 1;
SMS.prototype.FAILED = 2;

SMS.prototype.host = '202.39.54.130';
SMS.prototype.port = 8000;
SMS.prototype.connect = function (cb) {
  var self = this;

  cb = cb || function () {};

  this.client.connect(this.port, this.host, function () {
    // Connected
    self.status = self.CONNECTED;
    cb();
  });

  this.client.on('data', function (data) {
    self.responseHandler(data.toString('utf8'));
  });
};

SMS.prototype.responseHandler = function (msg) {
  if (msg.match('ID/Password check successful')) {
    this.emit('logined');
  } else if (msg.match('Password error')) {
    this.emit('login_failed');
  } else {
    console.log(msg);
    this.emit('sent', msg);
  }
};

SMS.prototype.auth = function () {
  var buf = new Buffer(266);
  buf.fill("\0", 0, 266);

  // Auth Message
  var msgSet = new Buffer(this.account + "\0" + this.password + "\0");

  // Auth Mode
  bufferpack.packTo('B', buf, 0, [0]);

  // UTF-8 Encoding
  bufferpack.packTo('B', buf, 1, [4]);

  // Priority (Not Effect)
  bufferpack.packTo('B', buf, 2, [0]);

  // Country Code (Reserved)
  bufferpack.packTo('B', buf, 3, [0]);

  // Message Set Length
  bufferpack.packTo('B', buf, 4, [msgSet.length]);

  // Message Body Length
  bufferpack.packTo('B', buf, 5, [0]);

  // Write Set
  msgSet.copy(buf, 6, 0, msgSet.length);
  this.client.write(buf);
};

SMS.prototype.send = function (target, message) {
  var sender = new Buffer(266);
  sender.fill("\0", 0, 266);

  // Target Number and Send Immediately
  var msgSet = new Buffer(target + "\0" + '01' + "\0");
  var msgBody = new Buffer(message);
  msgBody.slice(0, 160);

  // Sender Mode
  bufferpack.packTo('B', sender, 0, [1]);

  // UTF-8 Encoding
  bufferpack.packTo('B', sender, 1, [4]);

  // Priority (Not Effect)
  bufferpack.packTo('B', sender, 2, [0]);

  // Country Code (Reserved)
  bufferpack.packTo('B', sender, 3, [0]);

  // Message Set Length
  bufferpack.packTo('B', sender, 4, [msgSet.length]);

  // Message Body Length
  bufferpack.packTo('B', sender, 5, [msgBody.length]);

  msgSet.copy(sender, 6, 0, msgSet.length);
  msgBody.copy(sender, 106, 0, msgBody.length);
  this.client.write(sender);
};

module.exports = SMS;
