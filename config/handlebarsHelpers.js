module.exports = (hbs) => {
    hbs.registerHelper('TEST', function (value, options){
        return "test";
    });
};