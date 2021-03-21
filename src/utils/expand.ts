/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2021/3/17
 * Time: 10:17 下午
 */

// @ts-ignore
Array.prototype.deleteItem = function (index): Array<any> {
    this.splice(index, 1);
    return this;
};

// @ts-ignore
Array.prototype.replaceItem = function (index, newItem) {
    this.splice(index, 1, newItem);
    return this;
};

// @ts-ignore
Array.prototype.getLastItem = function () {
    return this[this.length - 1];
};

