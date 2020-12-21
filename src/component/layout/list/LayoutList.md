# layout-list 组件



| 参数       | 说明                           | 默认值 |
| ---------- | ------------------------------ | ------ |
| data-space | 控制列表中的每一项的上下的边距 | 20,20  |
| data-cols   | 每一行显示的数量               | 2      |



### 普通用法

```html

<div data-fn="layout-list" data-space="20,20" data-cols="2">
    <div>
        <input data-fn="data-chart"
               data-url="http://mingle-test.local.aidalan.com/server/mock/chart/funnel.json"
               data-type="bar"
               data-key="key"
               data-value="value"
               data-colors="#37c9e3"
               data-groupby="value"
               data-height="400"
        />
    </div>
    <div>
        <input data-fn="data-chart"
               data-url="http://mingle-test.local.aidalan.com/server/mock/chart/funnel.json"
               data-type="pie"
               data-key="key"
               data-value="value"
               data-colors="#37c9e3"
               data-groupby="value"
               data-height="400"
        />
    </div>
    <div>
        <input data-fn="data-chart"
               data-url="http://mingle-test.local.aidalan.com/server/mock/chart/funnel.json"
               data-type="bar"
               data-key="key"
               data-value="value"
               data-colors="#37c9e3"
               data-groupby="key"
               data-height="400"
        />
    </div>
    <div>
        <input data-fn="data-chart"
               data-url="http://mingle-test.local.aidalan.com/server/mock/chart/funnel.json"
               data-type="hbar"
               data-key="key"
               data-value="value"
               data-colors="#37c9e3"
               data-groupby="value"
               data-height="400"
        />
    </div>
    <div>
        <input data-fn="data-chart"
               data-url="http://mingle-test.local.aidalan.com/server/mock/chart/funnel.json"
               data-type="line"
               data-key="key"
               data-value="value"
               data-colors="#37c9e3"
               data-height="400"
        />
    </div>
    <div><input data-fn="data-chart"
                data-url="http://mingle-test.local.aidalan.com/server/mock/chart/funnel.json"
                data-type="rect"
                data-key="key"
                data-value="value"
                data-colors="#37c9e3"
                data-groupby="value"
                data-height="400"
    /></div>
</div>


```



### 结合 data-panel 以及模版引擎使用

```html
<div data-fn="data-panel" data-url="http://mingle.local.aidalan.com/server/mock/chart/funnel.json">
    <div data-fn="layout-list" data-cols="2" data-space="20,20">
        <div w-foreach="data as item">
            <div data-fn="data-chart"
                 data-url="http://mingle-test.local.aidalan.com/server/mock/chart/funnel.json"
                 data-type="hbar"
                 data-key="key"
                 data-groupby="value"
                 data-value="value"
                 data-colors="#37c9e3"
                 data-height="400"
            >
            </div>
            <div data-fn="data-table"
                 data-headerurl="http://mingle-test.local.aidalan.com/server/mock/table/tableHeader.json"
                 data-url="http://mingle-test.local.aidalan.com/server/mock/table/tableContent.json"
                 data-pagesize="50"
                 data-currentpage="1"
                 data-pages="50,100,200"
                 data-pagination="true"
                 data-position="bottomRight"
                 data-height="400"
            ></div>
        </div>
    </div>
</div>
```

