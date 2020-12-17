# Form-action组件



>  Form-action 组件的请求都是异步的，不会跳转页面，主要分两种情况 

1.  提交表单数据只触发列表渲染，查数据这种操作（只需要关联 图表 / 表格 / 列表即可，不用填写URL）
2. 提交表单后进行读写操作（填写具体接口的URL）



### form-action 组件参数

| 参数        | 说明 | 默认值 |
| ----------- | ---- | ------ |
| Data-layout |      |        |
|             |      |        |
|             |      |        |



### form表单内组件通用参数

| 参数 | 说明 | 默认值 |
| ---- | ---- | ------ |
|      |      |        |
|      |      |        |
|      |      |        |



### 数据查询 ( 只需要关联 图表 / 表格 / 列表即可，不用填写URL )

```html
<form data-fn="form-action"
      id="form"
      >

    <!-- 平台 -->
    <input data-fn="form-select" name="pf"
           value="1"
           data-label="平台:"
           data-mode="single"
           data-key="id"
           data-value="name"
           data-url="http://e.aidalan.com/option/pf/list" id="pf" data-size="sm">
    
    <button type="submit" class="ant-btn ant-btn-primary">提交</button>
    
</form>

<div data-fn="data-table"
     data-from="form"
     >
</div>
```





### 数据写入 和 编辑 （需要填写对应的URL）

发送一个异步请求，把表单的数据传入到 请求Body中

```html
<form data-fn="form-action"
      data-url="https://xxx.aidalan.com/api/xxx"
      >

    <!-- 平台 -->
    <input data-fn="form-select" name="pf"
           value="1"
           data-label="平台:"
           data-mode="single"
           data-key="id"
           data-value="name"
           data-url="http://e.aidalan.com/option/pf/list" id="pf" data-size="sm">
    
    <button type="submit" class="ant-btn ant-btn-primary">提交</button>
    
</form>

```









