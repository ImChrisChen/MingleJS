/** * Created by WebStorm. * User: MacBook * Date: 2020/12/10 * Time: 2:12 下午 */const fs = require('fs');const { resolve, extname } = require('path');const allowExtnames = ['.html', '.php', '.vue', '.tpl'];module.exports.getFiles = function (req, res, next) {    let [, path] = req.path.split('/files/');    let dirpath = resolve(__dirname, `../../${ path ? path : '' }`);        // template path    let content = readFiles(dirpath);    res.json(content);};function readFiles(dirpath) {    try {        let files = fs.readdirSync(dirpath);        let filenames = [];        files.forEach(filename => {            let filepath = resolve(dirpath, filename);         //文件路径            let isFile = fs.statSync(filepath).isFile();            if (isFile) {                let ext = extname(filepath);                if (allowExtnames.includes(ext)) {                    filenames.push(filename);                }            }        });        return {            status: true,            data: filenames,            message: 'ok',        };    } catch (e) {        console.log(e);        return {            status: false,            data: [],            message: '没有这个目录',        };    }}