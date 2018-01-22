const router = require('express').Router();
const getPackageJSON = require('../../modules/getpackagejson');

router.get('/:id/:branch/scripts', async (req, res) => {
    const packageJson = await getPackageJSON(req.params.id, req.params.branch);

    if(typeof packageJson.scripts === 'object' && Object.keys(packageJson.scripts).length > 0) {
        res.status(200).json(Object.keys(packageJson.scripts));
    } else {
        res.status(200).json([]);
    }
});

module.exports = router;
