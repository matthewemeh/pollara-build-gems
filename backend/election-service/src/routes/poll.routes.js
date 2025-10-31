const multer = require('multer');
const router = require('express').Router();

const { verifyToken } = require('../middlewares/auth.middlewares');
const { isValidID } = require('../middlewares/mongoose.middlewares');
const { addPoll, getPolls, deletePoll, updatePoll } = require('../controllers/form.controllers');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Add poll to a form (id: form id)
router.post('/:id', verifyToken, isValidID, upload.any(), addPoll);

// Update a poll (id: poll id)
router.patch('/:id', verifyToken, isValidID, upload.any(), updatePoll);

// Get all polls for a specific form (id: form id)
router.get('/:id', isValidID, getPolls);

// Delete a poll (id: poll id)
router.delete('/:id', verifyToken, isValidID, deletePoll);

module.exports = router;
