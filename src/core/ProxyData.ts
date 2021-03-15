/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/2/9
 * Time: 10:36 上午
 */
import { isObject } from '@utils/inspect';

export class ProxyData {

    constructor(o, cb?) {

        let handler = {

            get(target: any, p: PropertyKey, receiver: any): any {

                if (isObject(target[p])) {
                    //递归代理，只有取到对应值的时候才会代理
                    // console.log('收集依赖,递归代理', target, p);
                    return new Proxy(target[p], handler);
                }

                // console.log('收集依赖', target, p);
                return target[p];
            },
            set(target: any, p: PropertyKey, value: any, receiver: any): boolean {
                let oldValue = target[p];
                if (oldValue === value) {
                    // console.log('值没有变化', value);
                } else {
                    target[p] = value;
                    // console.log('触发更新', target, value, receiver);
                    cb?.();
                }
                return true;
            },
        };

        return new Proxy(o, handler);
    }
}
