var romanize = function(num) {
    if (!+num) return false;
    var digits = String(+num).split(""),
        key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
               "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
               "","I","II","III","IV","V","VI","VII","VIII","IX"],
        roman = "",
        i = 3;
    while (i--) {
        roman = (key[+digits.pop() + (i * 10)] || "") + roman;
    }
    return Array(+digits.join("") + 1).join("M") + roman;
}

var alphabetize = function(num) {
    var result = '';
    while (--num >= 0) {
        result = String.fromCharCode(65 + num % 26) + result;
        num /= 26;
    }
    return result;
}

module.exports = {
  "romanize": romanize,
  "alphabetize" : alphabetize
}