/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/11/27
 * Time: 1:42 下午
 */

const express = require('express');
const router = express.Router();
const logs = require('./logs');
const files = require('./files');
const mock = require('./mock');
const upload = require('./upload');

router.use((req, res, next) => {
    next();
});

router.get('/', (req, res, next) => {
    next();
});

router.use(mock);
router.use(logs);
router.use(files);
router.use(upload);

module.exports = router;

