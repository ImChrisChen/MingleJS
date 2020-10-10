/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/23
 * Time: 11:08 下午
 */

export {}; // 这个必须有，将文件转化为模块

declare global {
    interface Window {
        jsonCallBack: () => {}
    }
}
