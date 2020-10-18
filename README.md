# MingleJS 开发文档


React + Typescript + Antd + WUI

在融汇WUI的思想，实现的一套提供给后端开发者使用的前端组件库

`组件调用方式和组件传参，还是和WUI保持一致`



## 开发环境



1. 需安装 node  环境  
2. 配置nginx代理解决跨域（部分组件需要用到远程数据，本项目的url传入方式注定无法通过webpack-dev-server实现跨域）

拉去项目进入根目录，执行以下命令

~~~shell
npm install && npm run dev
~~~





## 使用方式



引入js
```html
<script src="https://mingle.aidalan.com/index.js"></script>
```

1. 表单组件调用方式为 <input data-fn="form-xxx" />非表单组件则用 <div data-fn="layout-xx"></div>
2. 组件所有属性均通过 <input data-*="属性值"> 组件默认值通过设置 input 上的value值即可
3. 组件均有生命周期



## 组件生命周期



MingleJS 包含4个组件生命周期

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



## 目录结构



```bash
├── README.md
├── config
│   └── component.config.ts					//组件配置文件(很重要)
├── dist									//打包生成的文件
│   ├── chart.min.js
│   ├── index.html
│   ├── index.js
│   ├── main.min.js
│   ├── manifest.min.js
│   └── report.html
├── ecosystem.config.js
├── main.tsx								// 入口文件
├── mock									// mock数据
│   ├── chart
│   ├── form
│   ├── list
│   └── table
├── package-lock.json
├── package.json
├── postcss.config.js
├── public									// 
│   ├── chart.html
│   ├── demo.html
│   ├── form
│   ├── index.html
│   └── index.js
├── script.js
├── src										// 
│   ├── App.scss	
│   ├── App.scss.d.ts
│   ├── App.tsx								// 
│   ├── component							// 组件（对外提供的组件都在这里）
│   ├── core								// 
│   ├── document							// 组件设计器（包括文档）
│   ├── interface							// 接口声明文件
│   ├── router								// 
│   └── services
├── static									// 静态资源文件
│   └── images
├── tsconfig.json
├── types									// types
│   ├── index.d.ts
│   └── typings.d.ts
├── utils									// 封装的常用函数
│   ├── format-data.ts
│   ├── inspect.ts
│   ├── parser-dom.tsx
│   ├── parser-property.ts
│   ├── parser-tpl.ts
│   ├── request
│   ├── trigger.ts
│   └── util.ts
└── webpack.config.js						// 打包配置
```





