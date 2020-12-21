/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/12/10
 * Time: 10:07 下午
 */

const express = require('express');
const router = express.Router();
const {getMockData} = require('../controller/mock');

router.get('*.json', getMockData);

module.exports = router;
