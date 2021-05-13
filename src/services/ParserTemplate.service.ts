/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/10/16
 * Time: 上午11:53
 */
import { getObjectValue, isArray, isDOM, isExpress, isObject, isObjectKeys, isUndefined, isWuiTpl } from '@src/utils';
import { ParserCharService } from '@services/ParserChar.service';
import { DataComponentUID } from '@src/App';

declare type IParseModeData = HTMLElement | object | null;

/**
 * tpl `<{var}>`
 * field `var`
 */

declare type tplTyle = 'tpl' | 'field'

// 模版匹配解析
export class ParserTemplateService extends ParserCharService {

    constructor() {
        super();
    }

    /**
     * 创建正则  模版替换/属性替换 换两种规则
     * @param type {tplTyle}
     * @param field {string}
     * @return {RegExp}
     */
    private static createRegExp(type: tplTyle, field): RegExp {
        let regExp;
        if (type === 'tpl') {
            regExp = new RegExp(`<{${ field }}>`, 'g');
        } else if (type === 'field') {
            // TODO 三元运算法加空格在这里会报错，后面有时间再优化这个，/?/
            // console.log(field);
            regExp = new RegExp(`${ field }`, 'g');
        }
        return regExp as RegExp;
    }

    /**
     * 模版替换 统一收拢
     * @param tpl {string}
     * @param regExp {RegExp}
     * @param value {string | object}
     * @return {string}
     */
    private static setTpl(tpl: string, regExp: RegExp, value: string | object): string {
        if (isObject(value) || isArray(value)) {
            value = JSON.stringify(value);
        }
        return tpl.replace(regExp, value);
    }

    /**
     * 提取模版字段 - `<{pf}>xxx<{game_id}>` [ 'pf', 'game_id' ];
     * @param tpl {string}
     * @return {Array<string>}
     */
    private static getTplFields(tpl: string): Array<string> {
        let matchArr: Array<string> = tpl.match(/<{(.*?)}>/g) ?? [];
        return matchArr.map(item => {
            let [ , fieldName ] = item.match(/<{(.*?)}>/) ?? [];
            return fieldName;
        });
    }

    /**
     * 匹配出表达式中模版字段 `pf / 2 + 100` => [pf]
     * @param {string} tpl
     * @return {Array<string>}
     */
    private static getExpressFields(tpl): Array<string> {
        let fields = tpl.match(/[^\s\n\!\|\&\+\-\*\/\=\>\<\(\)\{\}\~\%\'\"]+/g) ?? [];      // 匹配表达式中需要解析字段
        return fields.filter(item => isNaN(Number(item)));
    }

    /**
     * 'pf=<{pf}>' => 'pf=ios' 或者
     * 'data.length > 1' => '10 > 1' => true
     *
     * @param tpl
     * @param itemData
     * @param type
     */
    public parseTpl(tpl: string, itemData: IParseModeData = document.body, type: tplTyle = 'tpl'): string {

        if (!tpl) return tpl;

        tpl = this.parserEscape2Html(tpl);       // 字符替换 "&lt" => "<"

        let fields: Array<string> = [];
        if (type === 'tpl') {
            fields = ParserTemplateService.getTplFields(tpl);
        } else if (type === 'field') {
            fields = ParserTemplateService.getExpressFields(tpl);
        }
        // 模版字符替换 "<{pf}>" => "2"
        tpl = this.replaceTplDataValue(fields, itemData, tpl, type);

        // 表达式执行 如 "<{ 1 + 1 }>" => "2"
        tpl = tpl.replace(/<{(.*?)}>/g, v => {
            let [ , express ] = /<{(.*?)}>/.exec(v) ?? [];
            let exp = isExpress(express.trim());
            if (exp) {
                try {
                    return eval(express);
                } catch(e) {
                    // console.warn(`${ express } 表达式格式不正确,运算错误,以替换成空字符串`);
                    return '';
                }
            } else {        // 如果不是表达式,则不解析,返回
                // console.warn(`${ express } 不是表达式,未解析模版`);
                return type === 'tpl' ? `<{${ express }}>` : express;
            }
        });
        return tpl;
    }

    /**
     * 通过数据替换模版
     * @param {Array<string>} fields 字段集
     * @param {IParseModeData} itemData 要替换解析的数据
     * @param tpl {string} 模版内容
     * @param type {tplTyle} 替换处理类型
     * @return {string}
     */
    private replaceTplDataValue(fields: Array<string>, itemData, tpl, type: tplTyle = 'tpl'): string {
        fields.forEach(field => {
            let regExp = ParserTemplateService.createRegExp(type, field);

            if (isExpress(field.trim())) {
                let fs = ParserTemplateService.getExpressFields(field);
                tpl = this.replaceTplDataValue(fs, itemData, tpl, 'field');
            } else {

                // 多级属性访问 例如: "product.detail.title"
                if (isObjectKeys(field)) {

                    let objectValue = getObjectValue(field, itemData);      // 解析后的值

                    // if (isEmptyObject(objectValue)) {   // 如果是空对象，说明没匹配到值
                    if (isUndefined(objectValue)) {   // 如果是undefined，说明没匹配到值,或者值本来就是 undefined 都不做替换
                        let val = type === 'tpl' ? `<{${ field }}>` : field;
                        // tpl = tpl.replace(regExp, val);
                        tpl = ParserTemplateService.setTpl(tpl, regExp, val);
                    } else {
                        // tpl = tpl.replace(regExp, objectValue);
                        tpl = ParserTemplateService.setTpl(tpl, regExp, objectValue);
                    }
                    // 单级属性访问 例如: "<{product}>"
                } else {
                    let key = field.trim();
                    let val = isDOM(itemData)
                        ? encodeURIComponent((itemData.querySelector(`[${ DataComponentUID }][name=${ key }]`) as HTMLElement)?.attributes?.['value']?.value ?? '')
                        : (itemData[key]);

                    // 只有对象中有这个属性才会被替换
                    if (isUndefined(val)) {
                        // console.warn(` ${ field } 未匹配到模版变量，暂不替换`, itemData);
                    } else {
                        // tpl = tpl.replace(regExp, val);
                        tpl = ParserTemplateService.setTpl(tpl, regExp, val);
                    }
                }
            }
        });
        return tpl;
    }

}

