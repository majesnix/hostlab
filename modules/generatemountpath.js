const slugify = require('slugify');

module.exports.generateMountPath = function(userEmail, mountPath) {
    const userObj = userEmail.split('@');
    return `/${userObj[1]}/${userObj[0]}/${slugify(mountPath)}`;
};
