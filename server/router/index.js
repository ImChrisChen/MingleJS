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
const proxy = require('./proxy');



// middleware 这里可以做一些通用逻辑处理
router.use((req, res, next) => {
    console.log(req.path);
    
    if (req.path === '/') {
        let versions = process.versions;
        let html = '';
        for (const key in versions) {
            if (!versions.hasOwnProperty(key)) continue;
            let value = versions[key];
            html += `<p>${ key }: ${ value }</p>`;
        }
        res.end(`
            <h1>mingle-server</h1>
            <div>${ html }</div>
        `);
    }
    next();
});

router.use(mock);
router.use(logs);
router.use(files);
router.use(upload);
router.use(proxy);

module.exports = router;

