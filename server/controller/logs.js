/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/11/27
 * Time: 3:05 下午
 */

const fs = require('fs');
const path = require('path');
const logsPath = path.resolve(__dirname, '../logs', 'error.log');
const moment = require('moment');

const splitStart = `error_log: ---START--- \n `;
const splitEnd = `  \n ---END---\n`;
const logSplit = ` -----------------end-\n`;

module.exports.getLog = (req, res, next) => {

};

module.exports.getLogs = (req, res, next) => {

    let isExist = fs.existsSync(logsPath);

    if (!isExist) {
        res.send({
            msg: '获取失败',
            data: null,
            status: false,
        });
        return;
    }

    let content = fs.readFileSync(logsPath).toString();
    let data = [];

    for (let log of [...content.split(splitEnd)]) {
        if (!log) continue;
        [, log] = log.split(splitStart);
        let ret = log.split(logSplit);
        let [message, stack, url, date] = ret;
        data.push({message, stack, url, date});
    }

    res.send({
        msg: '获得成功',
        data: data,
        status: true,
    });
};

module.exports.createLog = (req, res, next) => {
    // console.log('cookies', req.cookies);
    let content = req.body;
    let {message, stack, url} = content;
    let date = moment().format('YYYY-MM-DD/HH:mm:ss');
    let log = `${splitStart} ${message}${logSplit}${stack} ${logSplit} ${url} ${logSplit} ${date} ${splitEnd}`;
    let ret = fs.writeFileSync(logsPath, log, {flag: 'a+'});

    if (!ret) {
        res.send({
            msg: '写入成功',
            data: null,
            status: true,
        });
    }

};


