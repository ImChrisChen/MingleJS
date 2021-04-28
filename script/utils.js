/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/4/22
 * Time: 6:13 下午
 */

const fs = require('fs');
const { resolve } = require('path');
const command = require('commander');

// /dist/build 的build目录名称
function getBuildDirName(type) {
    let basePath = resolve(__dirname, type === 'doc' ? '../dist/' : '../lib/');      // 要读取的目录
    let files = fs.readdirSync(basePath);
    let dirs = [];
    for (let stuff of files) {
        let pathname = resolve(basePath, stuff);
        if (isDir(pathname)) {
            dirs.push(stuff);
        }
    }
    return dirs[0] ? (dirs[0] + '/') : '';
}


function isDir(pathname) {
    return fs.statSync(pathname).isDirectory();
}

function format(args) {
    let o = {};
    for (const arg of args) {
        let [name, value] = arg.split('=');
        o[name] = value;
    }
    return o;
}

function getArgs() {
    return format(command.parse(process.argv).args)
}



module.exports = {
    getBuildDirName,
    isDir,
    format,
    getArgs,
};
