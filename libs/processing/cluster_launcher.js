var cluster, exports, numCPUs;
cluster = require('cluster');
numCPUs = require('os').cpus().length;
exports = module.exports = {
    launch: function() {
        var i;
        console.log('Before the fork');
        if (cluster.isMaster) {
            console.log('I am the master, launching workers!');
            for (i = 0; 0 <= numCPUs ? i < numCPUs : i > numCPUs; 0 <= numCPUs ? i++ : i--) {
                cluster.fork();
            }
        } else {
            console.log('I am a worker!');
        }
        return console.log('After the fork');
    }
};