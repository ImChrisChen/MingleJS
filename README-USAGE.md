# MingleJS 使用文档

`组件调用方式和组件传参，还是和WUI保持一致`

[comment]: <> (## 组件生命周期)

[comment]: <> (>  MingleJS组件提供了4个组件生命周期，如果有需要，可以根据业务逻辑在不同组件生命周期中去处理一下特定的逻辑。)

[comment]: <> (| 组件生命周期  | 使用方式                                         | 触发时机   |)

[comment]: <> (| ------------- | ------------------------------------------------ | ---------- |)

[comment]: <> (| before-load   | `<input data-fn="xx" @before-load="funcName">`   | 组件渲染前 |)

[comment]: <> (| load          | `<input data-fn="xx" @load="funcName">`          | 组件渲染后 |)

[comment]: <> (| before-update | `<input data-fn="xx" @before-update="funcName">` | 组件更新前 |)

[comment]: <> (| update        | `<input data-fn="xx" @update="funcName">`        | 组件更新后 |)

[comment]: <> (`load 和 update 钩子函数都将会接受一个参数, 该参数是组件的实例`)

[comment]: <> (```html)

[comment]: <> (<script>)

[comment]: <> (function funcName &#40;instance&#41; {)

[comment]: <> (  	// Coding 触发组件钩子)

[comment]: <> (}   )

[comment]: <> (</script>)

[comment]: <> (// or )

[comment]: <> (<script>)

[comment]: <> (window.funcName = function &#40;instance&#41; {)

[comment]: <> (  	// Coding 触发组件钩子)

[comment]: <> (}   )

[comment]: <> (</script>)

[comment]: <> (```)

## 全局方法

MingleJS 提供了几个全局方法以便于后端开发者，在不得已的情况下需要编写JS代码实现某些功能的时候提供使用

#### jQuery

可以直接使用 $

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

> 支持 if foreach ...拓展运算符 模版渲染等语法

#### 使用例子

~~~html

<div id="App">
    <ul>
        <li w-foreach="persons as (item,index)" w-if="index / 2 === 0"><{item.name}></li>
    </ul>
</div>

<script src="http://mingle.local.aidalan.com/index.js"></script>
<script>
    new Mingle({
        el: '#App',
        data: {
            persons: [
                {name: 'Chris'},
                {name: 'Box'},
                {name: 'Alex'},
            ]
        },
        created() {
            // console.log('数据已经收集，页面还未生成');
        },
        mounted() {
            // console.log('组件挂载完毕');
        },
        updated() {
            // console.log('组件更新');
        },
        methods: {},
    })
</script>

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
            {
                order_name: 'xxxx',
                order_id: 1
            },
            {
                order_name: 'xxxx',
                order_id: 2
            },
            {
                order_name: 'xxxx',
                order_id: 3
            },
            {
                order_name: 'xxxx',
                order_id: 4
            }
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

## 事件解析

##                                                                          

## 根据数据动态渲染组件

```html

<div id="App">
    <!-- define-component 组件可以进行自定义组件 -->
    <define-component w-foreach="components as component" data-fn="<{component.tag}>" ...component>
    </define-component>
</div>
<script>
    new Mingle({
        el: '#App',
        data: {
            components: [
                {
                    tag: 'form-button',
                    props: {
                        'name': 'pf',
                        'data-label': '平台',
                        'data-enum': '1,Android; 2,iOS; 3,MacOS; 4,Windows'
                    },
                },
                {
                    tag: 'form-radio',
                    props: {
                        'name': 'pf',
                        'data-label': '平台',
                        'data-enum': '1,Android; 2,iOS; 3,MacOS; 4,Windows'
                    },
                }
            ]
        }
    })
</script>


```

## Form 表单和表格/图表/ 列表 之间的关联

~~~html
// 表单组件 // 表单ID，用于关联需要控制的数据。
<form id="game-list" data-fn="form-action" data-async="true">
    <form-button
        data-label="平台:"
        data-enum="1,Andorid;2,iOS;3,MacOS;4,Windows"
        name="platform"
    ></form-button>

    <form-input data-label="游戏名称:" name="gameName" style="width: 200px"></form-input>

    <button type="reset" class="ant-btn ant-btn-waring">重置</button>

    <button type="submit" class="ant-btn ant-btn-primary">提交</button>

</form>

// 表格组件
<div data-fn="data-table"
     data-from="game-list"            // 需要关联的表单ID
>
</div>
~~~

## 字体图标

使用示例

```html

<icon type="AppleOutlined" color="#f0f00f" size="18"/>
```

| 属性  |                             说明                             |     示例      | 是否必填 |
| :---: | :----------------------------------------------------------: | :-----------: | :------: |
| type  | 图标类型,具体参考 [ant.design](https://ant.design/components/icon-cn/#components-icon-demo-iconfont) | AppleOutlined |    Y     |
| color |                           图标颜色                           |    #f0f00f    |    N     |
| size  |                           图标大小                           |      18       |    N     |


