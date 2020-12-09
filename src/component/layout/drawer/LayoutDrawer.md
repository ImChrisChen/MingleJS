# layout-drawer组件



| 参数         | 说明                                                        | 默认值 / string |
| ------------ | ----------------------------------------------------------- | --------------- |
| data-content | 按钮的文字                                                  | 点击弹窗        |
| data-title   | 抽屉弹窗层的标题                                            | 标题            |
| data-layout  | 抽屉弹出的方向  'top' \| 'bottom' \| 'left' \|'right'       | right           |
| data-length  | 抽屉的高度或者宽度 ，layout为top,bottom时是高度，否则是宽度 | 400             |
| data-mask    | 是否显示遮罩层                                              | false           |
| data-open    | 是否默认展开抽屉                                            | false           |



### 代码示例


```html

    <button class="ant-btn ant-btn-primary" data-fn="layout-drawer" data-content="Submit"
            data-title="标题3"
            data-length="400"
            data-layout="right"
            data-open="false"
    >
        <div class="container">
            <div data-fn="data-table"
                 data-height="400"
                 data-from="user_analysis"
                 data-headerurl="/mock/table/tableHeader.json"
                 data-url="/mock/table/tableContent.json"
            ></div>

        </div>
    </button>

```
