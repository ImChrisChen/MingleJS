/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/4/22
 * Time: 5:39 下午
 */
const readline = require('readline');
const path = require('path');
const clc = require('cli-color');
const fs = require('fs');
const { getBuildDirName, getArgs } = require('./utils');

let args = getArgs();

let instance = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

instance.question('请输入要更新的版本: ', v => {
    console.log(/(\d+)\.(\d+)\.(\d+)(-\w+)?/.test(v));      // 0.0.1-beat  0.0.1
    if (/(\d+)\.(\d+)\.(\d+)(-\w+)?/.test(v) || v === 'latest') {
        instance.close();
        
        let isDoc = args['type'] === 'doc';
        
        let filepath = isDoc ? `../dist/${ getBuildDirName('doc') }` : `../lib/${ getBuildDirName('lib') }`;
        
        try {
            let oldPath = path.resolve(__dirname, filepath);
            fs.renameSync(oldPath, path.resolve(__dirname, isDoc ? `../dist/${ v }` : `../lib/${ v }`));
            // consol.log('%修改成功，当前版本号: ', 'color: red');
            console.log(clc.blue(`
                 版本更新成功😄
                 
                当前版本号: ${ v }
    `));
            
        } catch (e) {
            console.log(e);
        }
    } else {
        instance.close();
        
    }
});
