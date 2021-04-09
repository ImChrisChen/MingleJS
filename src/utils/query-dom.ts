/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2021/4/5
 * Time: 3:31 下午
 */

// 获取当前页面所有组件
export function getCurrentComponents(container = document.body) {
    return [...container.querySelectorAll(`[data-component-uid]`)] as Array<HTMLElement>;
}

// 获取form表单中的所有组件 (带有name值的)
export function getFormComponents(container = document.body) {
    return [...container.querySelectorAll(`[name][data-component-uid][form-component]`)] as Array<HTMLElement>;
}

export function getFormComponentByName(name: string, container = document.body) {
    return container.querySelector(`[name=${ name }][data-component-uid][form-component]`) as HTMLElement;
}
