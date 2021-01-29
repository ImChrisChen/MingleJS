/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/11/27
 * Time: 3:05 下午
 */

const fs = require('fs');
const path = require('path');
const logsPath = path.resolve(__dirname, '../logs', 'error.log');
const logger = require('../logger');

module.exports.getLog = (req, res, next) => {

};

module.exports.getLogs = (req, res, next) => {
    let isExist = fs.existsSync(logsPath);
    if (isExist) {
        let logs = fs.readFileSync(logsPath).toString();
        let l = logs.split('\n').map(item => item ? JSON.parse(item) : '').filter(t => t);
        res.send({
            msg: '获得成功',
            data: l,
            status: true,
        });
    }
};

module.exports.createLog = (req, res, next) => {
    let content = req.body;
    // let { message, stack, url } = content;
    logger.log('error', 'error', content);
    res.send({
        msg: '写入成功',
        data: content,
        status: true,
    });
};


