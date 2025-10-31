const router = require('express').Router();

const { isValidID } = require('../middlewares/mongoose.middlewares');
const { validateAuthKey, verifyToken } = require('../middlewares/auth.middlewares');
const { getResults, getResult } = require('../controllers/form-results.controllers');

router.use(validateAuthKey);

router.get('/:id', isValidID, getResult);

router.use(verifyToken);

router.get('/', getResults);

module.exports = router;
