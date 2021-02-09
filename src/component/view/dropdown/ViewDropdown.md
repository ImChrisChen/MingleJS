# view-dropdown 下拉菜单



### 参数

| 参数名称     | 说明                         | 默认值 |
| ------------ | ---------------------------- | ------ |
| data-trigger | 触发事件 ‘click’  ｜ 'hover' | hover  |
| data-content | 按钮内容                     | ‘’     |



### 代码演示

包裹在内的DOM元素，才是下拉菜单的列表

```html
<span data-fn="view-dropdown" data-content="按钮">
    <a href="http://baidu.com">百度</a>
    <a href="http://taobao.com">淘宝</a>
</span>

```



### 嵌套data-panel 使用



```html
<div data-fn="data-panel" data-url="http://mingle.local.aidalan.com/server/mock/chart/funnel.json">
    <span data-fn="view-dropdown" data-content="按钮">
        <a w-foreach="data as (item,i)" href="http://taobao.com"><{ item.key }> index: <{i}></a>
    </span>
</div>
```
