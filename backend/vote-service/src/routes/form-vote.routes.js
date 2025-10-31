const router = require('express').Router();

const { isValidID } = require('../middlewares/mongoose.middlewares');
const { verifyFormVote } = require('../middlewares/vote.middlewares');
const { validateAuthKey, verifyToken } = require('../middlewares/auth.middlewares');
const {
  getVotes,
  fillForm,
  addVoteToken,
  verifyUserForm,
} = require('../controllers/form-vote.controllers');

router.use(validateAuthKey);

router.post('/fill', verifyFormVote, fillForm);

router.post('/verify', verifyUserForm);

router.use(verifyToken);

router.get('/:id', isValidID, getVotes);

router.post('/token', addVoteToken);

module.exports = router;
