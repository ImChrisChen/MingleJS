# tips-card 内容提示组件

### 参数

| 参数名       | 说明                        | 默认值 |
| :----------- | --------------------------- | ------ |
| data-trigger | 触发事件 ‘click’ \| 'hover' | hover  |
| data-title   | 提示窗标题                  | ''     |
| data-label | 文本内容                    | ‘查看详细信息’     |
| width        | 提示窗宽度                  | 300    |



### 代码示例

```html
<button class="ant-btn ant-btn-primary"
        data-fn="tips-card"
        data-title="标题"
        data-label="查看详细信息">
鼠标移入显示的内容
</button>
```

