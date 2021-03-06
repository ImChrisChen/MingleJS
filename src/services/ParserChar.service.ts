/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/2/8
 * Time: 11:56 上午
 */

/**
 * 字符解析服务
 */
export class ParserCharService {

    //普通字符转换成转意符
    public parserHtml2Escape(sHtml) {
        return sHtml.replace(/[<>&"]/g, function (c) {
            return {
                '<': '&lt;',
                '>': '&gt;',
                '&': '&amp;',
                '"': '&quot;',
            }[c];
        });
    }

    //转意符换成普通字符
    public parserEscape2Html(str: string): string {
        let arrEntities = {
            'lt'  : '<',
            'gt'  : '>',
            'nbsp': ' ',
            'amp' : '&',
            'quot': '"',
        };
        return str.replace(/&(lt|gt|nbsp|amp|quot);/ig, function (all, t) {
            return arrEntities[t];
        });
    }

    // 将多个连续空格合并成一个空格
    public parserMergeSpace(str: string): string {
        str = str.replace(/(\s|&nbsp;)+/g, ' ');
        return str;
    }

    // 去掉html标签
    public parserRemoveHtmlTag(tab: string): string {
        return tab.replace(/<[^<>]+?>/g, '');//删除所有HTML标签
    }

}
