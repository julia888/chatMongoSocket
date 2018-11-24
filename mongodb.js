const mongoose = require('libs/mongoose');
const async = require('async');
mongoose.set('debug', true);

async.series([
    open,
    dropDatabase,
    requireModels,
    createUsers
], function (err) {
    console.log(arguments);
    mongoose.disconnect();
    process.exit(err ? 255 : 0);
});

function open(callback){
    mongoose.connection.on('open', callback);
}
function dropDatabase(callback){
    let db = mongoose.connection.db;
    db.dropDatabase(callback);
}
function requireModels(callback) {
    require('models/user');

    async.each(Object.keys(mongoose.models), function (modelName, callback) {
        mongoose.models[modelName].createIndexes(callback);
    }, callback);
}
function createUsers(callback){
    let users = [
        {username: "User", password: "secret"},
        {username: "Petya", password: "123"},
        {username: "admin", password: "admin"}
    ];
    async.each(users, function (userData, callback) {
        let user = new mongoose.models.User(userData);
        user.save(callback);
    }, callback);
}


