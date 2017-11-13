module.exports = (hbs) => {
    hbs.registerHelper('TEST', (value, options) => {
        return "test";
    });
};