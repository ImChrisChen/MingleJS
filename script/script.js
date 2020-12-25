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

function bootstrap() {
    templateCompile();
    
    let file = fs.readFileSync(resolve(__dirname, '../public/index.js')).toString();
    if (/version = (.*?);/.test(file)) {
        let time = moment().format('YYYY-MM-DD/h:mm:ss/a');
        file = file.replace(/version = (.*?);/, `version = "${ time }";`);
        
        let saved = fs.writeFileSync(resolve(__dirname, '../dist/index.js'), file);
        
        if (typeof saved === 'undefined') {
            console.log(clc.blue(`
                      版本更新成功😄
            当前版本号: ${ time }
        `));
        }
    }
}

bootstrap();
