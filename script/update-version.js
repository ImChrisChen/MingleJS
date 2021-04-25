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
const { getBuildDirName } = require('./utils');
// const getBuild
// const exec = require('child_process').exec;
// let currentScript = path.resolve(__dirname, __filename);
// let command = ['node', currentScript].join(' ');

let instance = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});


instance.question('请输入要更新的版本: ', v => {
    console.log(/(\d+)\.(\d+)\.(\d+)(-\w+)?/.test(v));
    if (/(\d+)\.(\d+)\.(\d+)(-\w+)?/.test(v) || v === 'latest') {
        instance.close();
        try {
            let oldPath = path.resolve(__dirname, `../dist/${ getBuildDirName() }`);
            fs.renameSync(oldPath, path.resolve(__dirname, `../dist/${ v }`));
            // console.log('%修改成功，当前版本号: ', 'color: red');
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
