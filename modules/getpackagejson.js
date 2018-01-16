const snek = require('snekfetch');
const gitlab_token = process.env.GITLAB_TOKEN;
const gitlab_url = process.env.GITLAB_URL;

/**
 * Holt die PackageJSON vom übergebenen Gitlab Repository (ID) und der angegebenen Branch
 * @param {string} repositoryID The GitlabID of the repository
 * @param {string} [branch=master] The branch of the repository
 * @returns {Promise<Object>}
 * @example
 * //Holt die Package.json vom Projekt mit der ID 2 und der Branch 'master'
 * const info = await getPackageJSON('1');
 * 
 * //Holt die Package.json vom Projekt mit der ID 1 und der Branch 'test'
 * const info = await getPackageJSON('1','test');
 */
module.exports.getPackageJSON = (repositoryID, branch = 'master') => {

    return new Promise(async (resolve,reject) => {
        try {
            const { text } = await snek.get(`${gitlab_url}/api/v4/projects/${repositoryID}/repository/files/package.json/raw?private_token=${gitlab_token}&ref=${branch}`);
            resolve(JSON.parse(text));
        } catch (err) {
            reject(err);
        }
    });
};
