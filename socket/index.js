const fs = require("fs");

module.exports = function (server) {
    const io = require("socket.io").listen(server);
    io.set('origins', 'localhost:*');

    io.sockets.on('connection', function (socket) {
        socket.on('userConnect', function (username) {
            socket.broadcast.emit("join", username);

            socket.on("disconnect", function () {
                socket.broadcast.emit("leave", username);
            });
        });

        socket.on("message", function (text, cb) {
            fs.appendFile("history.txt", text+'\r\n', function(error){
                if(error) throw error;
            });
            socket.broadcast.emit("message", text);
            cb && cb();
        });
    });
};
