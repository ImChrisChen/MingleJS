/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/20
 * Time: 2:36 上午
 */

// 获取数组最后一项
export function arraylastItem<T>(array: Array<T>): T {
    let lastIndex = array.length - 1;
    return array[lastIndex];
}

export function deepEachElement(root, callback?: (el: HTMLElement) => void) {
    // 这里输出的是根节点
    if (!root) return;

    if (root.children.length) {
        Array.from(root.children).forEach(item => {
            return deepEachElement(item, callback);
        });
    }
    callback && callback(root);
}
// 前递归 => root => left => right => children
export function deepEach(
    tree: Array<object> = [],
    // callback: (node?: object | any, i?: number | any, parent?: object | any, resultArr?: Array<object> | any) => {},
    callback: Function,
    parent?: object,
    resultArr: Array<any> = [],
    children: string = 'children',
): void | Array<any> {

    for (let i = 0; i < tree.length; i++) {
        let node = tree[i];
        let childrens = node[children];

        if (callback) {
            /**
             * @node        当前节点
             * @i           当前节点所在组的Index
             * @parent      每一项的父节点
             * @resultArr   返回的数组
             */
            let callbackResult = callback(node, i, parent, resultArr);
            if (callbackResult) {
                resultArr.push(callbackResult);
            }
        }

        if (childrens && childrens.length > 0) deepEach(childrens, callback, node, resultArr, children);
    }

    return resultArr;

}


/**
 * 防抖函数
 * @param method 事件触发的操作
 * @param delay 多少毫秒内连续触发事件，不会执行
 * @returns {Function}
 */
export function debounce(method, delay) {
    let timer: any = null;
    return function temp() {
        let args = arguments;
        timer && clearTimeout(timer);
        timer = setTimeout(function () {
            method.apply(temp, args);
        }, delay);
    };
};
