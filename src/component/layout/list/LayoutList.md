# 代码演示





## layout-list

| 参数       | 说明                           | 默认值 |
| ---------- | ------------------------------ | ------ |
| data-space | 控制列表中的每一项的上下的边距 | 20,20  |
| data-row   | 每一行显示的数量               | 2      |



```html

<div data-fn="layout-list" data-space="20,20" data-row="2">
    <div>
        <input data-fn="data-chart"
               data-url="http://mingle-test.local.aidalan.com/mock/chart/funnel.json"
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
               data-url="http://mingle-test.local.aidalan.com/mock/chart/funnel.json"
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
               data-url="http://mingle-test.local.aidalan.com/mock/chart/funnel.json"
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
               data-url="http://mingle-test.local.aidalan.com/mock/chart/funnel.json"
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
               data-url="http://mingle-test.local.aidalan.com/mock/chart/funnel.json"
               data-type="line"
               data-key="key"
               data-value="value"
               data-colors="#37c9e3"
               data-height="400"
        />
    </div>
    <div><input data-fn="data-chart"
                data-url="http://mingle-test.local.aidalan.com/mock/chart/funnel.json"
                data-type="rect"
                data-key="key"
                data-value="value"
                data-colors="#37c9e3"
                data-groupby="value"
                data-height="400"
    /></div>
</div>


```
