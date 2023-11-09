# MingleJS 开发文档



技术栈：React + Typescript + Antd

描述：融汇WUI的思想，实现的一套开箱即用的前端组件库

面向用户群体：后端开发者，全栈开发

应用的业务场景：中后台系统

组件调用方式基于自定义元素 [Web Components](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components) 的规范实现



## 开发环境]



1. 需安装 node 环境 v12.16.1 👉🏿 [node官网](https://nodejs.org/zh-cn/)

2. 安装 pm2  进程管理工具 

	~~~shell
	npm install -g pm2
	~~~

3. 配置nginx代理解决跨域（由于项目特殊原因，接口的url时动态获取到的，所以直接用nginx配置域名跨越会比webpack-dev-server 要来的方便许多）

	Nginx 配置

	~~~nginx
    server {
        listen       		80;
        server_name  		"mingle-test.local.aidalan.com";
   
        set $ACAO '*';
   
        # mingle.js 项目
        location / {
            proxy_pass http://127.0.0.1:9000;
            add_header Access-Control-Allow-Origin '$ACAO';
        }
   
        # 框架入口文件不设置缓存，更新版本号后,保证每次都能加载到最新
        location = /index.js {
            add_header Cache-Control no-cache;
            add_header Pragma no-cache;
            add_header Expires 0;
        }
   
        # nodejs 服务器mock数据,对应目录项目根目录 /mock/*
        location /server {
            proxy_pass http://127.0.0.1:9001;
            add_header Access-Control-Allow-Origin '$ACAO';
        }
   
        access_log on;
   
        default_type 'text/html';
        charset utf-8;
    }	



## 项目启动



拉去项目进入根目录，执行以下命令

```shell
npm run start-all
```

npm run start-all  这条命令会通过pm2 执行两个任务，具体可查看 package.json命令配置

- webpack-dev-server 	[http://localhost:9000](http://localhost:9000)
- node 数据模拟服务器    [http://localhost:9001](http://localhost:9001)



#### 查看开发日志

~~~shell
pm2 log [对于的进程name 或者 id]
~~~

用浏览器访问 http://localhost:9000 或者 http://mingle-test.local.aidalan.com (需要配置nginx)



## 打包部署



项目根目录运行

~~~shell
npm run build
~~~

会在项目跟目录生成dist目录， 结构如下

~~~javascript
dist
└── latest
		├── assets						// 静态资源文件
    ├── index.html
    ├── index.js				// 框架入口文件（外部使用，只需要引入index.js就可以了）
    ├── main.css
    ├── main.min.js
    ├── main.min.js.LICENSE.txt
    ├── manifest.css
    ├── manifest.min.js
    ├── manifest.min.js.LICENSE.txt
    └── report.html			// 打包性能分析文件
~~~

把dist目录部署到服务器后，只需要用scrip标签引入 index.js 即可使用



#### 使用方式

~~~html
// 内网测试环境使用
<script src="http://mingle.local.aidalan.com/index.js"></script>

// 正式环境使用
<script src="http://mingle.aidalan.com/index.js"></script>
~~~



#### 代码打包分析

http://mingle.local.aidalan.com/report.html



## 项目说明

`本项目组件大致分为 “组件” 和 “子应用” 两个概念`

### 1.组件

组件通常是通过业务 提取出的高灵活性，高复用的视图层组件（通常不参杂业务逻辑）

代码实例：

```html
<data-table></data-table>  // 表格组件
```



### 2.子应用

子应用是在 组件的基础上，添加了业务的处理，通常只针对某些特殊系统去实现某个特殊的功能，才需要考虑以子应用的形式去实现。

子应用全部放在 ”app“ 下面 例如 app-xxx （以 <app- 开头的所有组件）

代码示例：

```html
// 渲染多个系统切换 和 菜单展示功能 ，内部集成了，不同系统的和菜单数据接口
<app-aside></app-aside>
```

> 该方式集成度比较高，可复用性差，如果不是必要情况，可以考虑让后端做业务的同学通过组件去自行实现
>
> 在这里我希望每个开发 / 维护 minglejs的 同学能对组件有自己的理解和看法
>
> **而不是成为盲目支撑需求的工具人**



### 3.功能模块

具体结构可参考  /config/component.config.ts

格式 : data-fn="模块-模块"

~~~html
<a data-fn="layout-window" href="https://baidu.com"></a>
~~~

==⚠️注意：功能模块必须导出一个 非React组件的  class 模块==

 

## 使用说明

1. 表单组件调用方式为 web-components形式（3.功能模块除外）
2. 组件所有属性均通过 data-*="属性值" 组件默认值通过设置上的value值即可



## 模拟数据

本项目提供了Mock数据

直接访问到 http://localhost:9000/server/mock/ 可以看到所有模拟数据

如果想要添加直接可以在 mock文件夹 下面，新建 json 文件即可，数据访问地址路由和目录结构相对应



例如：

数据地址为 /api/server/mock/table/tableContent.json

对应的目录结构就是项目更目录 `/server/mock/table/tableContent.json`



## 项目目录结构

```html
.
├── README-USAGE.md			// 使用文档
├── README.md				// 开发文档
├── config
│   ├── component.config.ts
│   └── directive.config.ts
├── dist			// 打包后生成的代码
├── ecosystem.config.js		// pm2 配置文件
├── main.tsx				// 项目入口文件
├── package.json
├── postcss.config.js
├── public			
│   ├── index.html
│   └── index.js
├── script					// 脚本文件
│   ├── script.js
│   └── template-generate.js
├── server					// node 服务（具有日志收集，mock数据，API提供等功能）
│   ├── controller
│   ├── ecosystem.config.js
│   ├── logger.js
│   ├── logs
│   ├── main.js
│   ├── mock
│   ├── router
│   ├── uploads
│   └── utils
├── src						// 
│   ├── App.less
│   ├── App.scss
│   ├── App.scss.d.ts
│   ├── App.tsx
│   ├── api
│   ├── component				// 对外开发的组件
│   ├── core
│   ├── interface				
│   ├── pages					
│   ├── private-component 		// 私有组件
│   ├── router
│   └── services				// 服务类
├── static						// 静态资源
│   ├── docs-image
│   ├── icons
│   └── images
├── tsconfig.json
├── types						// typescript 属性定义
│   ├── index.d.ts
│   └── typings.d.ts
├── utils						// 工具库
│   ├── inspect.ts
│   ├── parser-property.ts
│   ├── trans-dom.tsx
│   ├── trigger.ts
│   └── util.ts
└── webpack.config.js			
```



