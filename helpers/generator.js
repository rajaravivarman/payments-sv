module.exports = {
    authcode: function () {
        var min = 100000;
        var max = 999999;
        var random6digits = Math.floor(Math.random() * (max - min + 1)) + min;
        var auth_code = random6digits.toString();
        return auth_code;
    }
}