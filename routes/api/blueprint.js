const router = require('express').Router();
const log = require('debug')('hostlab:route:api:blueprint');
const User = require('../../models/user');
const snek = require('snekfetch');
const gitlab_token = process.env.GITLAB_TOKEN;
const gitlab_url = process.env.GITLAB_URL;

router.post('/', async (req, res, next) => {
	const blueprintName = req.param('name');
	const blueprintRepoID = req.param('repo')[0];
	const blueprintRepoBranch = req.param('repo')[1];

	const response = await snek.get(`${gitlab_url}/api/v4/projects/${blueprintRepoID}?private_token=${gitlab_token}`);
	const blueprintRepoName = JSON.parse(response.text).name;

	User.findByIdAndUpdate(req.user._id, {
		$push: {
			'blueprints.node': {
				name: `${blueprintName}`,
				containingRepoName: `${blueprintRepoName}`,
				containingRepoID: `${blueprintRepoID}`,
				containingRepoBranch: `${blueprintRepoBranch}`,
			},
		},
	}, (err, user) => {
		if (err) {
			return next(err);
		}
		res.send(200);
	});
});

router.delete('/:id', async (req, res, next) => {
	const blueprintID = req.param('id');

	User.findById(req.user._id, function(err, user) {
		user.blueprints.node.id(blueprintID).remove();
		user.save();
		res.send(200);
	});

});

module.exports = router;