// /app/sockets/receivers.server.sockets.js
var socketIO;
exports.receivers = (io) => {
socketIO = io;
io.emit('generated notification','hello sobhan');
}
// handle different type of notification.