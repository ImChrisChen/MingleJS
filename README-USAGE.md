# MingleJS 使用文档



## 模版语法

##### 文本渲染  &  属性渲染

数据绑定的形式就是使用“<{}>”语法的文本插值：

~~~html
<h1 title="<{title}>"> <{message}> World ~ </h1> // Hello World ~
<h1> <{message}> <{person.name}> </h1>  		// Hello Chris

<script>
    new Mingle({
		data: {
            message: "Hello",
            title: '我是一个H1元素',
            person: {
                name: "Chris"
            }
        }
	})
</script>
~~~



#### 模版语法里使用 javascript 表达式

~~~text
<{ (count + 1 }>
<{ (count + 100) / 2 }>
<{ true ? 'success' : 'fail' }>
<h1><{ title.length }></h1>
~~~



`模版内只允许包含表达式，以下例子都不会生效`

```Html
<!-- 这是语句，不是表达式 -->
<{ var a = 1 }>

<!-- 流控制也不会生效，请使用三元表达式 -->
<{ if (ok) { return message } }>
```



#### 事件解析

事件解析用的 @操作符号 例如： @[事件名称]=“[函数名称]”

@click=“handleClick” 不写括号调用的情况下直接返回事件对象

~~~html
<button @click="handleClick"> Submit </button> 			// "@click" 原生事件
<form-datapicker @onClear="handleClearDate"></form-datapicker>		// "@onClear" 元素自定义事件
~~~

~~~javascript
new Mingle({
    methods: {
        handleClick(e){   
            // 原生事件
        },
        handleClearDate () {
            // 自定义事件触发
        }
    }
})
~~~



#### 拓展运算符 （html版）

~~~html
<!-- 解析前 -->
<form-datepicker ...props></form-datepicker>

<!-- 解析后 -->
<form-datepicker 
	 data-label='label:'
	 data-disabled='false'
	 data-format='YYYY-MM-DD'
	 data-showtime='false'
	 data-picker='date'
	 data-single='false'
	 data-required='false'
	 data-smart='false'
	 data-usenow='true'
	 name='form-select'
></form-datepicker>
~~~

~~~javascript
new Mingle({
    data:{
      	props:{
            'data-label'   : 'label',
            'data-disabled': false,
            'data-format'  : 'YYYY-MM-DD',
            'data-showtime': false,
            'data-picker'  : 'date',
            'data-single'  : false,
            'data-required': false,
            'data-smart'   : false,
            'data-usenow'  : true,
            'name'         : 'form-select',
        }
    }
})
~~~





#### 指令

##### 条件渲染 w-if w-else

```html
<h1 w-if="visible"> Hi~ MingleJS</h1>
<h2 w-else>Bey Mingle JS</h2>
<script>
	new Mingle({
        data: {
            visible: true
        }
    })
</script>
```



##### 列表渲染	w-foreach

w-foreach 支持数组和对象两种遍历形式

数组：w-foreach="[数组] as ([数组的每一项], [数组下标])"

对象：w-foreach="[对象] as ([对象的key对应的value], [对象的key])"



只需要value时，可以省略掉 圆括号 `<span w-foreach="options as option"></span>`



~~~html
<ul>
    <li w-foreach="options as (option,index)" w-if="index % 2 === 0"><{ option.name }></li>
</ul>
<script>
	new Mingle({
        data: {
            options: [
                { name:"Chris" },
                { name:"Bob" },
                { name:"Alex" },
            ]
        }
    })
</script>
~~~



## API

#### Mingle

##### options 类型如下：

~~~typescript
interface IMingleOptions {
    el: string
    data?: object
    created?: (...args) => any
    methods?: {
        [key: string]: (...args: any) => any
    }
    updated?: (...args) => any
    mounted?: (...args) => any
}
~~~



| 属性    | 默认值        | 类型     | 描述                       | 用途                           |
| ------- | ------------- | -------- | -------------------------- | ------------------------------ |
| el      | "body"        | string   | 要解析的容器的dom选择器    | document.querySelector(el)     |
| data    | {}            | object   | 模版数据                   | 渲染模版变量                   |
| created | function (){} | Function | 数据已经收集，页面还未生成 | 在组件不同阶段做一些自定义操作 |
| mounted | function (){} | Function | 组件挂载完毕               | 在组件不同阶段做一些自定义操作 |
| updated | function (){} | Function | 组件更新                   | 在组件不同阶段做一些自定义操作 |
| methods | {}            | object   | 方法                       | 具体函数                       |



> 钩子函数 和 methods 的函数中可以 通过this 获取到 new Mingle() 的实例

##### Mingle类实例方法

jsonp请求

- `this.$jsonp`



ajax请求 （使用的是axios库，具体使用方式可查阅 👉🏿 [axios官方文档](http://www.axios-js.com/zh-cn/docs/)）

- `this.$get`
- `this.$post`
- `this.$put`
- `this.$delete`



~~~html
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



## 根据数据动态渲染组件

```html

<div id="App">
    <!-- define-component 组件可以进行自定义组件 -->
    <define-component w-foreach="components as component" 
                      data-fn="<{component.tag}>" ...component >
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


