const converter = require('../helpers/converter.js');

module.exports = {

    notifytraffic: function (string) {
        console.log('\n'.padStart(150, '-') + string + '\n'.padEnd(150, '-'));
    },

    displaytraffic: function (obj, spec) {
        for(let key in obj){
            if (obj[key] != "") {
            console.log(('Field ' + key.toString().padStart(3, '0') + ' [' + spec[key].name + ']' + ':').padEnd(50, '.') + converter.format_to_apacs(obj[key]));
            }
        }
    },

    logtraffic: function (req, res, spec) {
        console.log('\n'.padStart(150, '-') + 'Request Message' + '\n'.padEnd(150, '-'));
        if (spec.req != null){
            module.exports.displaytraffic(req, spec.req);
        } else {
            module.exports.displaytraffic(req, spec);
        }
        console.log('\n'.padStart(150, '-') + 'Response Message' + '\n'.padEnd(150, '-'));
        if (spec.res != null){
            module.exports.displaytraffic(res, spec.res);
        } else {
            module.exports.displaytraffic(res, spec);
        }
    }
    
}