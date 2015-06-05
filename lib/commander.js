var Promise = require("bluebird");
var spawn = require('child_process').spawn;

function commander(contents, cmd, args) {

    return new Promise(function (resolve, reject) {

        var result = '';

        var process = spawn(cmd, args);

        process.stdin.setEncoding = 'utf-8';
        process.stdin.write(contents);
        process.stdin.end();
        
        process.stdout.on('data', function(data) {
          result += data.toString();
        });
         
        // process.stdout.on('end', function() {
        //     resolve(result);
        // });

        process.stdout.on('close', function() {
            resolve(result);
        });

        process.stderr.on('data', function(data) {
            var error = data.toString();

            console.error(error);
        });

    });
}

module.exports = commander;