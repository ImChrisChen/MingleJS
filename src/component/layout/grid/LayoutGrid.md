#  layout-grid组件



## 24 栅格系统

#####  每个data-fn="layout-grid"代表一行，如果想实现多行可以写多个layout-grid组件，或者用layout-list替代

## 参数

| 属性名                     | 说明                                        | 默认值             |
| -------------------------- | ------------------------------------------- | ------------------ |
| data-grid (子元素上的属性) | 栅格占位格数，为 0 时相当于 `display: none` | 24 / 子元素.length |
|                            |                                             |                    |
|                            |                                             |                    |



## 演示代码

```html
<div data-fn="layout-grid">
    <div data-grid="18">
        <!-- 自定义内容 -->
        <div data-fn="data-chart"
             data-url="http://mingle-test.local.aidalan.com/server/mock/chart/areauser.json"
             data-type="bar"
             data-key="location"
             data-value="count,count2"
             data-colors="#37c9e3"
             data-groupby=""
             data-interval="0"
             data-height="400"
             data-point="circle"
             data-pointsize="1"
             data-title="标题"
             data-showupdate="false"
        ></div>
    </div>
    <div data-grid="6">
        <!-- 自定义内容 -->
        <div data-fn="data-chart"
             data-url="http://mingle-test.local.aidalan.com/server/mock/chart/areauser.json"
             data-type="bar"
             data-key="location"
             data-value="count,count2"
             data-colors="#37c9e3"
             data-groupby=""
             data-interval="0"
             data-height="400"
             data-point="circle"
             data-pointsize="1"
             data-title="标题"
             data-showupdate="false"
        ></div>
    </div>
</div>

```
