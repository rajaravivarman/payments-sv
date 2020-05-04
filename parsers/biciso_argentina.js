const converter = require('../helpers/converter.js');
const generator = require('../helpers/generator.js');

module.exports = {

    parse: function (data, spec) {
        var req = {};
        var res = {};

        var hexdata = data.toString();
        var req_message_length = hexdata.substring(0, 4);
        console.log('Request Message Length:...' + req_message_length);

        var hexdataiso = hexdata.substring(4, hexdata.length);

        var asciidata = hexdataiso;
        var str_req = asciidata;

        var header = str_req.substring(0, 10);
        var header_tpdu_id = header.substring(0, 2);
        var header_origin = header.substring(2, 6);
        var header_destination = header.substring(6, 10);
        var MTI = str_req.substring(10, 14);

        req[0] = MTI;
        var req_bmp = str_req.substring(14, 30);
    

    
        binval = ""
        for (let i = 0; i < req_bmp.length; i++) {
    
            binval += converter.hex2bin(req_bmp[i]);
    
        }
    
        bitmap = binval.toString();
        res_bitmap = "";
    
        currpos = 30;
        available_fields = [];
    

    
        for (let i = 0; i < bitmap.length; i++) {

    
            if (bitmap[i] == "1") {

                available_fields.push(i + 1);

                switch (spec[i+1].format) {
                    case "llvar":
                        var llvar_len = parseInt(str_req.substring(currpos, currpos +  2));
                        if (spec[i+1].encoding == "ascii") {
                            llvar_len = llvar_len * 2;
                        }
                        req[i + 1] = str_req.substring(currpos, currpos + llvar_len + 2);
                        if (spec[i+1].encoding == "ascii") {
                            req[i + 1] = converter.hex_to_ascii(req[i + 1].substring(2, req[i + 1].length));
                        } else {
                        req[i + 1] = req[i + 1].substring(2, req[i + 1].length);
                        }
                        currpos = currpos + llvar_len + 2;
                        break;
                    case "lllvar":
                        var lllvar_len = parseInt(str_req.substring(currpos, currpos +  4));
                        if (spec[i+1].encoding == "ascii") {
                            lllvar_len = lllvar_len * 2;
                        }
                        req[i + 1] = str_req.substring(currpos, currpos + lllvar_len + 4);
                        if (spec[i+1].encoding == "ascii") {
                            req[i + 1] = converter.hex_to_ascii(req[i + 1].substring(4, req[i + 1].length));
                        } else {
                        req[i + 1] = req[i + 1].substring(4, req[i + 1].length);
                        }
                        currpos = currpos + lllvar_len + 4;
                        break;           
                    default:
                        var fixed_length = spec[i + 1].length;
                        if (spec[i+1].encoding == "ascii") {
                            fixed_length = fixed_length * 2;
                            req[i + 1] = converter.hex_to_ascii(str_req.substring(currpos, currpos + fixed_length));
                        } else {
                            req[i + 1] = str_req.substring(currpos, currpos + fixed_length);
                        }
                        
                        currpos = currpos + fixed_length;
                        break;
                }
    
            }
    
        }
    
    
        if (MTI == '0800') {
            res_MTI = '0810'
        } else if (MTI == '0200') {
            res_MTI = '0210'
        } else if (MTI == '0400') {
            res_MTI = '0410'
        }
    
        
        var auth_code = generator.authcode();

        res["39"] = "00";
    
        res[0] = res_MTI;
        if (res[0] == '0810') {
            res[3] = req [3];
            res[12] = req[7].substr(4,10);
            res[13] = req[7].substr(0,4);
            res[24] = req[24];
            res[41] = req[41];
        } else if (res[0] == '0210') {
            res[2] = req[2];
            res[3] = req[3];
            res[4] = req[4];
            res[7] = req[7];
            res[11] = req[11];
            res[24] = req[24];
            res[37] = "      " + req[11];
            if (req[38] != null){
                res[38] = req[38];
            } else {
            res[38] = auth_code;
            }
            res[39] = "00";
            res[41] = req[41];
            res[42] = req[42];
            res[48] = req[48];
            res[49] = req[49];
            res[63] = "MESSAGE TEST FIELD 63                   ";
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
    
    
    
    
        var res_header = header_tpdu_id + header_destination + header_origin;
        var str_res = res_header;
    
        res[1] = res_bmp.toUpperCase();
    
    
    
        for (let key in res) {

            if (spec[key] != null && res[key] != null) {

                switch (spec[key].format){
                    case "llvar":
                        if (spec[key].encoding == "ascii"){
                        str_res = str_res + (converter.ascii_to_hex(res[key]).length/2).toString().padStart(2, '0') + converter.ascii_to_hex(res[key]);
                        } else {
                        str_res = str_res + res[key].length.toString().padStart(2, '0') + res[key];
                        }
                        break;
                    case "lllvar":
                        if (spec[key].encoding == "ascii"){
                        str_res = str_res + (converter.ascii_to_hex(res[key]).length/2).toString().padStart(4, '0') + converter.ascii_to_hex(res[key]);
                        } else {
                        str_res = str_res + res[key].length.toString().padStart(4, '0') + res[key];
                        }
                        break;
                    default:
                        if (spec[key].encoding == "ascii"){
                        str_res = str_res + converter.ascii_to_hex(res[key]);
                        } else {
                        str_res = str_res + res[key];
                        }
                        break;
    
                }

        }
        }
    

        var hexresp = str_res;

        var hexbytearray = converter.hexToBytes(hexresp);

        res_message_length = hexbytearray.length.toString(16).padStart(4, '0').toUpperCase();

        var response_message = res_message_length + hexresp;

        return {req, res, response_message};
    }

}