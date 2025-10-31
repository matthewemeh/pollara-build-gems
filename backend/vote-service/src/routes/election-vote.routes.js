const router = require('express').Router();

const { isValidID } = require('../middlewares/mongoose.middlewares');
const { verifyElectionVote } = require('../middlewares/vote.middlewares');
const { validateAuthKey, verifyToken, verifyUser } = require('../middlewares/auth.middlewares');
const {
  getVotes,
  castVote,
  addVoteToken,
  verifyUserVote,
} = require('../controllers/election-vote.controllers');

router.use(validateAuthKey, verifyToken);

router.get('/:id', isValidID, getVotes);

router.use(verifyUser);

router.post('/token', addVoteToken);

router.post('/verify', verifyUserVote);

router.post('/cast', verifyElectionVote, castVote);

module.exports = router;
