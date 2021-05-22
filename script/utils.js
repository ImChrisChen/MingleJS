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
    return format(command.parse(process.argv).args);
}

function rmdir() {
    let args = getArgs();
    let isDoc = args['type'] === 'doc';
    let filepath = isDoc ? `../dist` : `../lib`;
    let abspath = resolve(__dirname, filepath);
    try {
        _delDir(abspath)
        console.log(`${ abspath } 删除成功`);
    } catch (e) {
        if (e) throw e;
    }
}

function _delDir(path) {
    let files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            let curPath = path + '/' + file;
            if (fs.statSync(curPath).isDirectory()) {
                _delDir(curPath); //递归删除文件夹
            } else {
                fs.unlinkSync(curPath); //删除文件
            }
        });
        fs.rmdirSync(path);  // 删除文件夹自身
    }
}

module.exports = {
    getBuildDirName,
    isDir,
    format,
    getArgs,
    rmdir,
};
