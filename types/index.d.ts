/** * Created by WebStorm. * User: MacBook * Date: 2020/10/12 * Time: 4:07 下午 */declare global {    interface Window {        jsonCallBack: (ret?: any) => any        [key: string]: any    }}// 这个必须有，将文件转化为模块export {};