/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/11/11
 * Time: 3:13 下午
 */
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = new express();
const url = require('url');

let rootpath = path.resolve(__dirname, '../');
app.get('*.json', async (req, res) => {
    let [filename] = req.url.split('?');
    let filepath = rootpath + filename;
    let fileContent = await readFile(filepath);      // JSONString
    let functionName = req.query.jsoncallback;
    // let result = {
    //     status: true,
    //     data: [],
    //     message: 'ok',
    // };
    if (functionName) {
        res.send(`${ functionName }(${ fileContent })`);
    } else {
        res.send(fileContent);
    }
});

app.listen('8081', function () {
    console.log('http://localhost:8081');
});

async function readFile(path) {
    try {
        return await fs.readFileSync(path).toString();
    } catch (e) {
        console.error('文件读取失败', e);
        return JSON.stringify({
            data: [],
            status: false,
            message: '文件读取失败',
        });
    }
}

function fullUrl(req) {
    return decodeURIComponent(url.format({
        protocol: req.protocol,
        host: req.get('host'),
        pathname: req.originalUrl,
    })).split('?')[0];
}

