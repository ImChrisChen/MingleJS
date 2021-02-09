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
const { send } = require('../utils/utils');

module.exports.getLog = (req, res, next) => {

};


// type 'http' | 'error' | 'performance'
module.exports.getLogs = (req, res, next) => {
    
    let type = req.query.type;
    
    let isExist = fs.existsSync(logsPath);
    if (isExist) {
        let logs = fs.readFileSync(logsPath).toString();
        let l = logs.split('\n').map(item => item ? JSON.parse(item) : '').filter(t => {
            if (type) {
                return t.log_type === type;
            } else {
                return t;
            }
        });
        
        send(req, res, {
            msg: '获得成功',
            data: l,
            status: true,
        });
    }
};

module.exports.createLog = (req, res, next) => {
    // let { message, stack, url } = content;
    // logger.log('error', 'error', content);
    
    let content = req.body;
    let logtype = req.query.type;
    console.log(logtype);
    
    try {
        switch (logtype) {
            case 'http':
                handleHttpLog(content);
                break;
            case 'error':
                handleErrorLog(content);
                break;
            case 'performance':
                handlePerformanceLog(content);
        }
        res.send({
            msg: '写入成功',
            data: content,
            status: true,
        });
    } catch (e) {
        console.log(e);
    }
    
};

function handlePerformanceLog(log = {}) {
    logger.info('PERFORMANCE', log);
}

function handleHttpLog(log = {}) {
    logger.info('HTTP', log);
}

function handleErrorLog(log = {}) {
    logger.error('ERROR', log);
}


