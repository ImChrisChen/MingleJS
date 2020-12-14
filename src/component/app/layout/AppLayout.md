# app-layout 组件

app-layout组件的子元素，有data-slot属性。

分别为: 

 data-slot="aside"		左边菜单

 data-slot="main"		中间的body内容



data-slot 的元素，会被使用到对应的区域中，aside, main



```html
<div data-fn="app-layout" class="ant-layout" style="display: flex; flex-direction: row;">

    <div data-slot="aside">
        <div data-fn="layout-menu"
             data-url="http://mingle-test.local.aidalan.com/mock/tree.json"
             data-open="true"
             data-id="id"
             data-pid="parent"
             data-name="name"
             data-layout="inline"
             data-children="children"
             data-width="200"
        ></div>
    </div>


    <div data-slot="main">
        <div data-fn="data-table"
             data-headerurl="http://mingle.local.aidalan.com/mock/table/tableHeader.json"
             data-url="http://mingle.local.aidalan.com/mock/table/tableContent.json"
             data-pagesize="50"
             data-pages="50,100,200"
             data-pagination="true"
             data-position="bottomRight"></div>
    </div>

</div>

```
