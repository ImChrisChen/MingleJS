/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/12/15
 * Time: 1:47 下午
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/proxy', function (req, res, next) {
    console.log(res);
    let url = 'https://auc.local.aidalan.com/user.selectTag/save?public=1&name=123';
    // functionget(url).then(r => {
    //     console.log(r);
    // });
    res.send({
        stauts: true,
        data: [],
        message: 'ok',
    });
    
});

router.post('/proxy', function (req, res, next) {

});

module.exports = router;
