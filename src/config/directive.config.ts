/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/12/1
 * Time: 3:36 下午
 */

export const directiveIf = 'w-if';
export const directiveElse = 'w-else';
export const directiveForeach = 'w-foreach';
export const directiveSlot = 'w-slot';
export const directiveReadonly = 'w-readonly';

// 组件生命周期
export enum Hooks {
    load = '@load',                 // 组件加载完成后
    beforeLoad = '@before-load',    // 组件加载完成前
    update = '@update',             // 组件更新完成后
    beforeUpdate = '@before-update' // 组件加载完成前
}
