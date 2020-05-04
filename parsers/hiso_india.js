const converter = require('../helpers/converter.js');
const generator = require('../helpers/generator.js');

module.exports = {

    parse: function (data, spec) {
        var req = {};
        var res = {};
        var hexdata = data.toString();
        var req_message_length = hexdata.substring(0, 4);
        console.log('Request Message Length:...' + req_message_length);
        var req_extraneous_data = hexdata.substring(hexdata.length - 2, hexdata.length);
        console.log('Extraneous Data:..........' + req_extraneous_data);
        var hexdataiso = hexdata.substring(4, hexdata.length - 2);
        var asciidata = converter.hex_to_ascii(hexdataiso);
        var str_req = asciidata;

        var header = str_req.substring(0, 12);
        var MTI = str_req.substring(12, 16);
        req[0] = MTI;
        var req_bmp = str_req.substring(16, 48);
    

    
        binval = ""
        for (let i = 0; i < req_bmp.length; i++) {
    
            binval += converter.hex2bin(req_bmp[i]);
    
        }
    
        bitmap = binval.toString();
        res_bitmap = "";
    
    
        currpos = 16;
        available_fields = [];
    
    
        for (let i = 0; i < bitmap.length; i++) {
    
            if (bitmap[i] == "1") {
    
                available_fields.push(i + 1);

                req[i + 1] = str_req.substring(currpos, currpos + spec[i + 1].length);
    
                currpos = currpos + spec[i + 1].length;
    
            }
    
        }
    
        res = JSON.parse(JSON.stringify(req));
    
        if (MTI == '0800') {
            res_MTI = '0810'
        } else if (MTI == '0200') {
            res_MTI = '0210'
        } else if (MTI == '0400') {
            res_MTI = '0410'
        }
    
    
        res["39"] = "00";

        var auth_code = generator.authcode();
    
    
        res[0] = res_MTI;
        if (res[0] == '0210') {
            res[38] = auth_code;
            res[63] = "129& 0000200129! B100107 103 NYCI070315223703016469001231Y502000Y00000000900000000000800000000000700000000000600018401010101021D   1"
            res[128] = "6CF696BC124C29AF"
            res[15] = ""
            res[18] = ""
            res[43] = ""
            res[62] = ""
            res[120] = ""
        }
    
    
        let j = 1;
        for (let i = 1; i <= bitmap.length; i++) { //i and j start at 1 because field 1 (bitmap) is the start
    
    
            if (i == Object.keys(res)[j]) {
                if (res[Object.keys(res)[j]] != "") {
                    res_bitmap = res_bitmap + '1';
                    j = j + 1;
                } else {
                    res_bitmap = res_bitmap + '0';
                    j = j + 1;
                }
            } else {
                res_bitmap = res_bitmap + '0';
            }
        
        }
    
    
        var res_bmp = ""
        for (let i = 0; i < res_bitmap.length; i = i + 4) {
    
            res_bmp += converter.bin2hex(res_bitmap.substring(i, i + 4));
    
        }
        
        var str_res = header;
    
        res[1] = res_bmp.toUpperCase();
    
    
    
        for (let key in res) {
            str_res = str_res + res[key];
        }
    
        var hexresp = converter.ascii_to_hex(str_res) + req_extraneous_data;
    
        var hexbytearray = converter.hexToBytes(hexresp);
        res_message_length = hexbytearray.length.toString(16).padStart(4, '0').toUpperCase();

        var response_message = res_message_length + hexresp;


        return {req, res, response_message};
    }

}