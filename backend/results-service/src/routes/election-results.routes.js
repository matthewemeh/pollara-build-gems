const router = require('express').Router();

const { isValidID } = require('../middlewares/mongoose.middlewares');
const { validateAuthKey, verifyToken } = require('../middlewares/auth.middlewares');
const { getResults, getResult } = require('../controllers/election-results.controllers');

router.use(validateAuthKey, verifyToken);

router.get('/', getResults);

router.get('/:id', isValidID, getResult);

module.exports = router;
