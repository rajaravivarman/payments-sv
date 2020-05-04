module.exports = {

    hex_to_ascii: function (hex) {
        var hexstr = hex.toString(); 
        var str = '';
        for (var i = 0;
            (i < hexstr.length && hexstr.substr(i, 2) !== '00'); i += 2)
            str += String.fromCharCode(parseInt(hexstr.substr(i, 2), 16));
        return str;
    },
    
    ascii_to_hex: function (ascii) {
        var arr1 = [];
        for (var n = 0, l = ascii.length; n < l; n++) {
            var hex = Number(ascii.charCodeAt(n)).toString(16);
            arr1.push(hex);
        }
        return arr1.join('');
    },
    
    hexToBytes: function (hex) {
        for (var bytes = [], c = 0; c < hex.length; c += 2)
            bytes.push(parseInt(hex.substr(c, 2), 16));
        return bytes;
    },
    
    bytesToHex: function (bytes) {
        for (var hex = [], i = 0; i < bytes.length; i++) {
            var current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
            hex.push((current >>> 4).toString(16));
            hex.push((current & 0xF).toString(16));
        }
        return hex.join("");
    },

    hex2bin: function (hex) {
        return (parseInt(hex, 16).toString(2)).padStart(4, '0');
    },

    bin2hex: function (bin) {
        return (parseInt(bin, 2).toString(16));
    },

    ascii_to_hex_bytes: function (ascii) {
        let hex = module.exports.ascii_to_hex(ascii);
        for (var bytes = [], c = 0; c < hex.length; c += 2)
            bytes.push(hex.substr(c, 2));
        return bytes;
    },

    format_to_apacs: function (ascii) {

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
    
        let sep = Object.values(separator);
        let hex_bytes = module.exports.ascii_to_hex_bytes(ascii);

        let formatted_ascii = "";
        for (let i = 0; i < hex_bytes.length; i++){
            let conv = "";
            for (let j = 0; j < sep.length; j++){
            if(hex_bytes[i].toString().toUpperCase() == sep[j].hex) {
                formatted_ascii = formatted_ascii + sep[j].ebcdic;
                conv = "done";
            } 
    
            } 
            if(conv != "done") {
                formatted_ascii = formatted_ascii + module.exports.hex_to_ascii(hex_bytes[i]);
            }       
        }
            return formatted_ascii;
        }
}