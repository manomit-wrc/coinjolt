// server.js
var socketIO = require('socket.io');
var socketIOHelper = require('./app/helpers/socketio');
// var PORT = 8080;
var PORT = process.env.PORT || 8080;

var server = app.listen(PORT, function() {
  console.log('Listening on PORT ' + PORT);
});
var io = socketIO(server);
socketIOHelper.set(io);
var receivers = require('./app/sockets/receivers.server.sockets');
receivers.receivers(io);