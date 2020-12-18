# MingleJS 使用文档

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



## 全局方法

MingleJS 提供了几个全局方法以便于后端开发者，在不得已的情况下需要编写JS代码实现某些功能的时候提供使用

#### jQuery

这个没有不知道的吧，不用多说了



#### Message 全局提示

顶部居中显示并自动消失，是一种不打断用户操作的轻量级提示方式。

可以把代码复制到控制台中感受下效果



使用示例：

```html
<script>
	Message.success('success');
    Message.error('fail');
    Message.info('info');
    Message.loading('loading')
</script>
```

**更多操作可参考👉🏿 [ant.design](https://ant-design.gitee.io/components/message-cn/)**



## Notice

使用示例：

```html
<script>
Notice.open({
    message: 'Notification Title',
    description:
      'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
  });
</script>
```

**更多操作可参考👉🏿  [ant.design](https://ant-design.gitee.io/components/notification-cn/) **





## 模版解析

> data-panel组件支持 if foreach 模版渲染等语法

#### 使用例子

~~~html
<div data-fn="data-panel" data-url="http://sim.local.superdalan.com/e.data/account-total">
    
    <div>接口状态status: <{status}> </div>
    <div>昨天: <{data.today_cost}> </div>
        
    <div w-if="status">接口状态正确时显示的内容</div>
	<div w-else>接口状态异常时显示的内容</div>
        
	<div w-if="data.order_list.length > 0" 
         w-foreach="data.order_list as item">
		订单名称：<{item.order_name}>
		订单ID：<{item.order_id}>
	</div>
    <div w-else>暂无数据</div>
        
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
<form id="game-list" data-fn="form-action" data-async="true">				
    <input data-fn="form-button" 
           data-label="平台:"
           data-enum="1,Andorid;2,iOS;3,MacOS;4,Windows" 
           name="platform"
           />

    <input data-fn="form-input" data-label="游戏名称:" name="gameName" style="width: 200px">
    
    <button type="reset" class="ant-btn ant-btn-waring">重置</button>

    <button type="submit" class="ant-btn ant-btn-primary">提交</button>
    
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


