const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');
const adminController = require('../controllers/admin');
const validation = require('../middlewares/validation');
const task = require('../middlewares/task.js')
const nullValidation = require('../middlewares/nullValidation');

const { verifyToken } = require('../middlewares/auth');
const { verifyAdmin } = require('../middlewares/admin');


router.put('/profile/update', verifyToken, nullValidation, userController.updateUserProfile);

router.post('/createTask', verifyToken, userController.createTask );

router.put('/updateUserTask', verifyToken, task.verifyTaskUpdate, userController.updateUserTask);

router.get('/getMyTask', verifyToken, userController.getMyTasks);

router.get('/createdTask', verifyToken, userController.createdTasks );

router.post('/logout', verifyToken, userController.logout);



router.post('/admin/create', verifyToken, verifyAdmin, validation, adminController.createUser);

router.get('/admin/users', verifyToken, verifyAdmin, adminController.getUsers);

router.put('/admin/updateTask', verifyToken, verifyAdmin, task.verifyTaskUpdate, adminController.updateTask );

router.post('/admin/createTask', verifyToken, verifyAdmin, adminController.createTask );

router.get('/admin/viewTask', verifyToken, verifyAdmin, adminController.getTasks );

router.get('/admin/:id', verifyToken, verifyAdmin, adminController.getUserById);

router.put('/admin/:id', verifyToken, verifyAdmin, nullValidation, adminController.updateUser);

router.delete('/admin/:id', verifyToken, verifyAdmin, adminController.deleteUser);


module.exports = router;
