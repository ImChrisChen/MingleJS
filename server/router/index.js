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
const fs = require('fs');
const { send } = require('../utils/utils');
const { resolve, extname } = require('path');

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

router.get('/urls', getAllUrls);

function readDir(src) {
    let files = fs.readdirSync(src);
    let components = {};
    for (let file of files) {
        let pathname = resolve(src, file);
        let isDir = fs.statSync(pathname).isDirectory();
        if (isDir) {
            let c = readDir(pathname);
            components = Object.assign(components, c);
        } else {        // 文件
            if (!file.includes('d.ts')) {       // 排除 .d.ts
                let ext = extname(pathname);
                if (ext === '.json') {
                    [file] = file.split('.');
                    [, pathname] = pathname.split('/server');
                    components[file] = '/server' + pathname;
                }
            }
        }
    }
    return components;
}

async function getAllUrls(req, res) {
    let data = readDir(resolve(__dirname, '../mock'));
    send(req, res, {
        status: true,
        msg: 'ok',
        data,
    });
}

router.use(mock);
router.use(logs);
router.use(files);
router.use(upload);
router.use(proxy);

module.exports = router;

