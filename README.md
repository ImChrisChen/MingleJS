# MingleJS 开发文档


React + Typescript + Antd + WUI

在融汇WUI的思想，实现的一套提供给后端开发者使用的前端组件库

`组件调用方式和组件传参，还是和WUI保持一致`



## 使用方式

引入js

```html
<script src="mingle.aidalan.com"></script>
```

1. 表单组件调用方式为 <input data-fn="form-xxx" />非表单组件则用 <div data-fn="layout-xx"></div>
2. 组件所有属性均通过 <input data-*="属性值"> 组件默认值通过设置 input 上的value值即可
3. 组件均有生命周期



## 组件生命周期

MingleJS 包含4个组件生命周期

| 组件生命周期 | 使用方式                                          | 触发时机   |
| ------------ | ------------------------------------------------- | ---------- |
| beforeLoad   | `<input data-fn="xx" hook:beforeLoad="funcName">`   | 组件渲染前 |
| Load         | `<input data-fn="xx" hook:load="funcName">`         | 组件渲染后 |
| beforeUpdate | `<input data-fn="xx" hook:beforeUpdate="funcName">` | 组件更新前 |
| Update       | `<input data-fn="xx" hook:update="funcName">`       | 组件更新后 |

```html
<script>
function funcName () {
  	// Coding 触发组件钩子
}   
</script>

// or 

<script>
window.funcName = function () {
  	// Coding 触发组件钩子
}   
</script>
```



