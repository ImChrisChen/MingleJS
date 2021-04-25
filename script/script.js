/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/25
 * Time: 12:15 上午
 */

const fs = require('fs');
const { resolve } = require('path');
const moment = require('moment');
const clc = require('cli-color');
const { templateCompile } = require('./template-generate');
const command = require('commander');
const { getBuildDirName, isDir } = require('./utils');


let args = format(command.parse(process.argv).args);

function format(args) {
    let o = {};
    for (const arg of args) {
        let [name, value] = arg.split('=');
        o[name] = value;
    }
    return o;
}

function run() {
    templateCompile();
    
    let file = fs.readFileSync(resolve(__dirname, '../public/index.js')).toString();
    if (/date = (.*?);/.test(file)) {
        let time = moment().format('YYYY-MM-DD/h:mm:ss/a');
        file = file.replace(/date = (.*?);/, `date = "${ time }";`);
        
        // TODO 需要根据不同打包区分 dist目录和lib目录
        
        let pathname = args['type'] === 'doc'
            ? resolve(__dirname, `../dist/${ getBuildDirName() }index.js`)
            : resolve(__dirname, `../lib/${ getBuildDirName() }index.js`);
        
        try {
            fs.writeFileSync(pathname, file);
            console.log(clc.blue(`
                  更新成功😄
                 
      最后一次修改时间为: ${ time }
    `));
        } catch (e) {
            console.error(e);
        }
        
    }
}

run();

