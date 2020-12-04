# 模版引擎使用教程



`data-url 演示接口数据格式`

~~~json
{
	"status": true,
	"message": "ok",
	"data": [
		{
			"name": "Chris",
			"age": 20
		},
		{
			"name": "Alex",
			"age": 18
		}
	]
}
~~~



### 模版变量解析语法

MingleJS 使用 <{}> 语法，匹配模版语法，例如下面代码 <{}> 中的 message会被当作变量解析

此时模版中的 <{message}>会被解析成  “ok”

可以在模版中写JS脚本表达式 和简单的函数处理



#### **数据则来源于data-url中返回的数据**

```html
<div data-panel="data-fn" data-url="http://mingle.local.aidalan.com/mock/example/example.json">
    message: <{message}>
</div>
```



### 指令

>  指令中的直接写表达式即可，不需要用 <{}> 包裹

#### ~foreach 指令

我们可以用 `~foreach` 指令基于一个数组来渲染一个列表。`~foreach` 指令需要使用 `items as item` 形式的特殊语法，其中 `items` 是源数据数组，而 `item` 则是被迭代的数组元素的**别名**。



**可以在遍历时获取数组的下标**

~~~html
<div w-foreach="data as (item,index)"> <{index}> </div>
~~~





```html
<div data-fn="data-panel" data-url="http://mingle.local.aidalan.com/mock/example/example.json">
    <ul w-foreach="data as item">
        <li> name: <{item.name}> </li>
		<li> age: <{item.name}> </li>
    </ul>
</div>
```

结果:

![](http://mingle.local.aidalan.com/static/docs-image/data-panel-example.png)





#### w-if 指令

指令 (Directives) 是带有 `w-if` 前缀的特殊 attribute。指令 attribute 的值预期是**单个 JavaScript 表达式**

指令内的表达式为true时，w-if 上的元素则会被

> w-if="status" 	中的status 直接回被当作变量解析，数据则对应的上面URL的最外层 status 属性。

```html
<div data-fn="data-panel" data-url="http://mingle.local.aidalan.com/mock/example/example.json">
	<p w-if="status"> status: <{status}> </p>
    <p w-else> else </p>
</div>
```

w-if 指令和w-else 指令可以配合使用
