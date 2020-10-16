/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/26
 * Time: 2:37 下午
 */

import { create, injectable } from './ioc';


class C {
    b() {
        console.log('this is b');
    }
}

@injectable
class B {
    constructor(private c: C) {
        this.c.b();
    }
}


let a = create(B);
console.log(a);


//接口的另一种形式
abstract class Demo {
    abstract key: string
}

const o: Demo = {
    key: '123123'
}
