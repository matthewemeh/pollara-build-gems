const multer = require('multer');
const router = require('express').Router();

const { validateAuthKey, verifyToken } = require('../middlewares/auth.middlewares');
const { registerFace, fetchUserFaceID } = require('../controllers/face-id.controllers');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.use(validateAuthKey, verifyToken);

router.get('/fetch', fetchUserFaceID);

router.post('/register', upload.any(), registerFace);

module.exports = router;
