const express = require('express');
const userCtrl = require('../controllers/userController')

const router = express.Router()

router.route('/register').post(userCtrl.register)

module.exports = router