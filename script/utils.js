/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/4/22
 * Time: 6:13 下午
 */

const fs = require('fs');
const { resolve } = require('path');

// /dist/build 的build目录名称
function getBuildDirName() {
    let basePath = resolve(__dirname, '../dist/');      // 要读取的目录
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


module.exports = {
    getBuildDirName,
    isDir,
};
