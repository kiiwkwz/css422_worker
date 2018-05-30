module.exports = class Base62 {
    
    constructor() {
        this.ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    }
    
     encode(value) {
        if (typeof (value) !== 'number') {
            throw 'Value is not number!';
        }

        var result = '', mod;
        do {
            mod = value % 62;
            result = this.ALPHA.charAt(mod) + result;
            value = Math.floor(value / 62);
        } while (value > 0);

        return result;
    }

    decode(value) {
        var result = 0;
        for (var i = 0, len = value.length; i < len; i++) {
            result *= 62;
            result += ALPHA.indexOf(value[i]);
        }

        return result;
    };
};