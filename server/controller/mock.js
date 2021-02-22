/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/12/10
 * Time: 10:09 下午
 */

const path = require('path');
const rootpath = path.resolve(__dirname, '../');
const fs = require('fs');
const { send } = require('../utils/utils');

module.exports.getMockData = async (req, res) => {
    let [filename] = req.url.split('?');
    let filepath = rootpath + filename;
    let content = await readFile(filepath);      // JSONString
    send(req, res, content);
};

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

