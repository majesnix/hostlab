const slugify = require('slugify');
const snek = require('snekfetch');
const log = require('debug')('hostlab:module:retrieveUserGitlabProjects');

module.exports = async function(userGitlabId) {
	const { text } = await snek.get(`${process.env.GITLAB_URL}/api/v4/projects?private_token=${process.env.GITLAB_TOKEN}&sudo=${userGitlabId}&membership=true`);
	const projects = JSON.parse(text);

	const repositories = [];

	for (let project of projects) {
		let packagejson;
		try {
			packagejson = (await snek.head(`${process.env.GITLAB_URL}/api/v4/projects/${project.id}/repository/files/package.json?private_token=${process.env.GITLAB_TOKEN}&ref=master`)) ? true : false;
		} catch (err) {
			// Catches snekfetch promise rejection, no need to process this.
		}

		if (!project.archived && packagejson) {
			let projBranches = JSON.parse((await snek.get(project._links.repo_branches + `?private_token=${process.env.GITLAB_TOKEN}`)).text);

			repositories.push({
				id: project.id,
				name: project.name,
				path: project.path_with_namespace,
				repo_url: project.http_url_to_repo,
				branches: projBranches.map(e=>e.name)
			});
		}
	}

	return repositories;
};
