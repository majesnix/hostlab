const express = require('express');
const router = express.Router();
const path = require('path');
const { changePassword, changeAvatar, deactivateUser, createUser } = require('../app/controller/userController');
const { createProject, deleteProject, changeProjectName, addParticipant, removeParticipant, createApplication, deleteApplication, createDatabase, deleteDatabase } = require('../app/controller/projectController');
const asyncHandler = require('express-async-handler');

// File upload handler
const multer = require('multer');

// where should the file be save and under what name
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/vendor/assets');
  },
  filename: (req, file, cb) => {
    // ENHANCEMENT: do not hardcode filextension, but adjust accordingly
    cb(null, `${req.user.user.matrnr}.png`/*${path.extname(file.originalname).toLowerCase()}`*/);
  }
});

// apply storage configuration and add filetype check
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = (/jpe?g|png|bmp/);
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
    if (mimetype && extname) {
      return cb(null, true);
    }

    req.flash('error', 'Wrong filetype');
    cb(null, false);
  } 
});

router.post('/changepassword', require('connect-ensure-login').ensureLoggedIn('/'), asyncHandler(changePassword));
router.post('/changeavatar', require('connect-ensure-login').ensureLoggedIn('/'), upload.single('avatar'), asyncHandler(changeAvatar));
router.post('/deactivateuser', require('connect-ensure-login').ensureLoggedIn('/'), asyncHandler(deactivateUser));
router.post('/createuser', require('connect-ensure-login').ensureLoggedIn('/'), asyncHandler(createUser));
router.post('/createproject', require('connect-ensure-login').ensureLoggedIn('/'), asyncHandler(createProject));
router.post('/deleteproject', require('connect-ensure-login').ensureLoggedIn('/'), asyncHandler(deleteProject));
router.post('/changeprojectname', require('connect-ensure-login').ensureLoggedIn('/'), asyncHandler(changeProjectName));
router.post('/addparticipant', require('connect-ensure-login').ensureLoggedIn('/'), asyncHandler(addParticipant));
router.post('/removeparticipant', require('connect-ensure-login').ensureLoggedIn('/'), asyncHandler(removeParticipant));
router.post('/createapplication', require('connect-ensure-login').ensureLoggedIn('/'), asyncHandler(createApplication));
router.post('/deleteapplication', require('connect-ensure-login').ensureLoggedIn('/'), asyncHandler(deleteApplication));
router.post('/createdatabase', require('connect-ensure-login').ensureLoggedIn('/'), asyncHandler(createDatabase));
router.post('/deletedatabase', require('connect-ensure-login').ensureLoggedIn('/'), asyncHandler(deleteDatabase));

module.exports = router;