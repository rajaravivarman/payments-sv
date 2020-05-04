const converter = require('../helpers/converter.js');
const generator = require('../helpers/generator.js');

module.exports = {
    parse: function (data, spec) {

        var spec_req = spec.req;
        var spec_res = spec.res;
        var req = {};
        var res = {};

        var separator = {
            start_of_text : {
                hex : "02",
                ebcdic : "<STX>"
            },
            end_of_text : {
                hex : "03",
                ebcdic : "<ETX>"
            },
            field_seperator : {
                hex : "1C",
                ebcdic : "<FS>"
            },
            unit_seperator : {
                hex : "1F",
                ebcdic : "<US>"
            },
            record_seperator : {
                hex : "1E",
                ebcdic : "<RS>"
            },
            group_seperator : {
                hex : "1D",
                ebcdic : "<GS>"
            }
        }
        
        var hexdata = data.toString();
        var req_message_length = hexdata.substring(0, 4);
        console.log('Request Message Length:...' + req_message_length);
        var start_of_text = hexdata.substring(4, 6);
        console.log('Start of Text <STX>:...' + start_of_text);
        var end_of_text = hexdata.substring(hexdata.length - 2, hexdata.length);
        console.log('End of Text <ETX>:..........' + end_of_text);
        var hexdatatoparse = hexdata.substring(6, hexdata.length - 2);
        
        
        var seperated_fields = hexdatatoparse.split("1c");
        
        var req = {};
        var fs_counter = 1;
        var cursor = 0;
        for (let key in spec_req){            
        
            if (spec_req[key].name.toString() != 'Field Separator'){
                if ( key <= 5) {
                    req[key] = converter.hex_to_ascii(seperated_fields[0]).substring(cursor, cursor + spec_req[key].length);
                    cursor = cursor + spec_req[key].length;
                    
                    continue;
                } else {
            req[key] = converter.hex_to_ascii(seperated_fields[fs_counter]);
            
            fs_counter = fs_counter + 1;
            
            }
        
        }
        }
        
        
        var auth_code = generator.authcode();
        
        

        res = {}

        switch(req[4]) {
            //Sale, Pre-auth and Post-auth
            case 'B2':
                //Dial Indicator
                res[0] = req[0];
                //Terminal ID
                res[1] = req[1];
                //Message Number
                res[2] = req[2];
                //Message Type
                res[3] = "12";
                //Response Code
                res[4] = "00";
                //Request Confirmation Code
                res[5] = "0";
                //Auth Code
                res[6] = auth_code;
                //Text Message
                res[10] = "AUTH CODE:" + auth_code;
                //Additional Response Data
                res[20] = "100800";
                //Aux Data
                res[22] = "00<RS>1001<GS>MCC4668980327  "
                break;
            //Void
            case '25':
                //Dial Indicator
                res[0] = req[0];
                //Terminal ID
                res[1] = req[1];
                //Message Number
                res[2] = req[2];
                //Message Type
                res[3] = "12";
                //Response Code
                res[4] = "00";
                //Request Confirmation Code
                res[5] = "0";
                //Auth Code
                res[6] = auth_code;
                //Text Message
                res[10] = "REVERSAL ACCEPTED";
                break;
            default:
                //Dial Indicator
                res[0] = req[0];
                //Terminal ID
                res[1] = req[1];
                //Message Number
                res[2] = req[2];
                //Message Type
                res[3] = "12";
                //Response Code
                res[4] = "05";
                //Request Confirmation Code
                res[5] = "0";
                //Text Message
                res[10] = "UNKNOWN TXNTYPE";
                break;
          }
    
    
        if (res[22] != null) {
        res[22] = res[22].replace("<GS>",converter.hex_to_ascii(separator.group_seperator.hex))
                         .replace("<RS>",converter.hex_to_ascii(separator.record_seperator.hex));
        }

        var str_res = "";
        
    
    
        for (let key in spec_res) {
    
            if(spec_res[key].name.toString() != 'Field Separator') {
                if(res[key] != null) {
                str_res = str_res + converter.ascii_to_hex(res[key]);
                }
            } else {
                str_res = str_res + separator.field_seperator.hex.toLowerCase();
            }
        }
    
        var hexresp = start_of_text + str_res + end_of_text;
    
    
        var hexbytearray = converter.hexToBytes(hexresp);
        res_message_length = hexbytearray.length.toString(16).padStart(4, '0').toUpperCase();
    
        var response_message = res_message_length + hexresp;
    

        return {req, res, response_message};
    }
    
}