/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2021/3/21
 * Time: 2:12 下午
 */

const {resolve, extname} = require('path');
const fs = require('fs');
let src = resolve(__dirname, '../src/component')

function isDir(pathname) {
    return fs.statSync(pathname).isDirectory();
}

function readDir(src) {
    let files = fs.readdirSync(src);
    let components = {}
    ;
    for (let file of files) {
        let pathname = resolve(src, file);
        if (isDir(pathname)) {
            let c = readDir(pathname);
            components = Object.assign(components, c);
        } else {        // 文件
            if (!file.includes('d.ts')) {       // 排除 .d.ts
                let ext = extname(pathname);
                if (ext === '.tsx' || ext === '.ts') {
                    [file] = file.split('.');
                    components[file] = pathname;
                }
            }
        }
    }
    return components;
}

function entries() {
    return readDir(src)
}

module.exports = {
    entries,
    isDir,
}
