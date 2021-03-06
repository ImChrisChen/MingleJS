/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/12/25
 * Time: 3:41 下午
 */

const fs = require('fs');
const path = require('path');
const clc = require('cli-color');

function replaceHtml(rootpath) {
    let files = fs.readdirSync(rootpath);
    let count = 0;
    files.forEach(file => {
        let filepath = path.resolve(rootpath, file);
        let content = fs.readFileSync(filepath).toString();
        let afterContent = content.replace(/http:\/\/mingle.local.aidalan.com/g, '/');
    
        // let afterContent = content.replace(/http:\/\/mingle.local.aidalan.com/g, 'http://mingle-test.local.aidalan.com');
    
        if (afterContent !== content) {
            let error = fs.writeFileSync(filepath, afterContent);
            if (typeof error === 'undefined') {
                count++;
            } else {
                throw error;
            }
        }
    });
    
    console.log(
        clc.blue(`                 模版替换成功🤡
        
                 共更新了${ count }个文件`));
}

module.exports.templateCompile = function () {
    let rootpath = path.resolve(__dirname, '../template/');
    replaceHtml(rootpath);
};

