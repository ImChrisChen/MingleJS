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

const router = require('./router/index');
const bodyParser = require('body-parser');     // json 解析中间件

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(router);

app.listen('8081', function () {
    console.log('http://localhost:8081');
});


function fullUrl(req) {
    return decodeURIComponent(url.format({
        protocol: req.protocol,
        host: req.get('host'),
        pathname: req.originalUrl,
    })).split('?')[0];
}

