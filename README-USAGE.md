MingleJS 使用文档

`组件调用方式和组件传参，还是和WUI保持一致`

## 组件生命周期

>  MingleJS组件提供了4个组件生命周期，如果有需要，可以根据业务逻辑在不同组件生命周期中去处理一下特定的逻辑。

| 组件生命周期  | 使用方式                                         | 触发时机   |
| ------------- | ------------------------------------------------ | ---------- |
| before-load   | `<input data-fn="xx" @before-load="funcName">`   | 组件渲染前 |
| load          | `<input data-fn="xx" @load="funcName">`          | 组件渲染后 |
| before-update | `<input data-fn="xx" @before-update="funcName">` | 组件更新前 |
| update        | `<input data-fn="xx" @update="funcName">`        | 组件更新后 |

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

## 模版解析

> data-panel组件支持 if foreach 模版渲染等语法

#### 使用例子

~~~html
<div data-fn="data-panel" data-url="http://sim.local.superdalan.com/e.data/account-total">
    
    <div>接口状态status: <{status}> </div>
    <div>昨天: <{data.today_cost}> </div>
        
    <div @if="status">接口状态正确时显示的内容</div>
	<div @else>接口状态异常时显示的内容</div>
        
	<div @if="data.order_list.length > 0" 
         @foreach="data.order_list as item">
		订单名称：<{item.order_name}>
		订单ID：<{item.order_id}>
	</div>
    <div @else>暂无数据</div>
        
</div>
~~~


#### data-url数据格式

```json
{
    "data": {
        "today_cost": "512046",
        "ad_status": {
            "running_unit": "423",
            "not_running_unit": "2",
            "pause_unit": "135",
            "out_of_budget_unit": "195"
        },
        "order_list": [
            {order_name:'xxxx', order_id: 1},
            {order_name:'xxxx', order_id: 2},
            {order_name:'xxxx', order_id: 3},
            {order_name:'xxxx', order_id: 4},
        ],
        "coverage": {
            "media": "2",
            "dl_game_id": "5",
            "original_id": "1"
        },
        "yesterday_cost": "575441"
    },
    "status": true
}
```


## Form 表单和表格/图表/ 列表 之间的关联

~~~html
// 表单组件 // 表单ID，用于关联需要控制的数据。
<form id="game-list" data-fn="form-ajax" data-async="true">				
    <input data-fn="form-button" 
           data-label="平台:"
           data-enum="1,Andorid;2,iOS;3,MacOS;4,Windows" 
           name="platform"
           />

    <input data-fn="form-input" data-label="游戏名称:" name="gameName" style="width: 200px">
    
    <button type="submit" class="ant-btn ant-btn-primary">Submit</button>	
    
</form>

// 表格组件
<div data-fn="data-table" 
     data-from="game-list"			// 需要关联的表单ID
     >
</div>
~~~


## 字体图标


使用示例

```html
<icon type="AppleOutlined" color="#f0f00f" size="18" />
```

| 属性  |                             说明                             |     示例      | 是否必填 |
| :---: | :----------------------------------------------------------: | :-----------: | :------: |
| type  | 图标类型,具体参考 [ant.design](https://ant.design/components/icon-cn/#components-icon-demo-iconfont) | AppleOutlined |    Y     |
| color |                           图标颜色                           |    #f0f00f    |    N     |
| size  |                           图标大小                           |      18       |    N     |


