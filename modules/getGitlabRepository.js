const snek = require('snekfetch');
const log = require('debug')('hostlab:module:retrieveUserGitlabProjects');

module.exports = async function(repoId) {
    const { text } = await snek.get(`${process.env.GITLAB_URL}/api/v4/projects/${repoId}?private_token=${process.env.GITLAB_TOKEN}`);
    const repo = JSON.parse(text);

    return repo;
};
