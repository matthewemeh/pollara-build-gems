const router = require('express').Router();

const pollRoutes = require('./poll.routes');
const { isValidID } = require('../middlewares/mongoose.middlewares');
const { verifyToken, validateAuthKey } = require('../middlewares/auth.middlewares');
const {
  addForm,
  getForm,
  getForms,
  deleteForm,
  updateForm,
  getUserForms,
  getUserVotedForms,
} = require('../controllers/form.controllers');

router.use(validateAuthKey);

router.use('/polls', pollRoutes);

// Add a form
router.post('/', verifyToken, addForm);

// Get all forms with public visibility
router.get('/', verifyToken, getForms);

// Get all forms authored by a user
router.get('/user', verifyToken, getUserForms);

// Get all forms a user has voted/filled
router.get('/get-user-voted-forms', verifyToken, getUserVotedForms);

// Get specfic form (id: form id)
router.get('/:id', isValidID, getForm);

// Update a form (id: form id)
router.patch('/:id', verifyToken, isValidID, updateForm);

// Delete a form (id: form id)
router.delete('/:id', verifyToken, isValidID, deleteForm);

module.exports = router;
