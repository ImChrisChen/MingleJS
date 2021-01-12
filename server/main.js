/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/11/11
 * Time: 3:13 下午
 */

const express = require('express');
const app = new express();
const url = require('url');

const router = require('./router/index');
const bodyParser = require('body-parser');     // json 解析中间件
const port = 9001;

// app.use(cookieParser());

app.all('*', (req, res, next) => {
    
    // console.log(req.path);
    
    //设置允许跨域的域名，*代表允许任意域名跨域
    res.header('Access-Control-Allow-Origin', '*');
    
    //允许的header类型
    res.header('Access-Control-Allow-Headers', 'content-type');
    
    //跨域允许的请求方式
    res.header('Access-Control-Allow-Methods', 'DELETE,PUT,POST,GET,OPTIONS');
    
    // if (req.method.toLowerCase() === 'options') {
    //     res.send(200);  //让options尝试请求快速结束
    // } else {
    next();
    // }
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// http://mingle.local.aidalan.com/server
app.use('/server', router);

app.listen(port, function () {
    console.log(`http://localhost:${ port }`);
});


function fullUrl(req) {
    return decodeURIComponent(url.format({
        protocol: req.protocol,
        host: req.get('host'),
        pathname: req.originalUrl,
    })).split('?')[0];
}

