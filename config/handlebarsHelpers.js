module.exports = function(hbs){
    hbs.registerHelper('TEST', function (value, options) {
        return "test";
    });
};