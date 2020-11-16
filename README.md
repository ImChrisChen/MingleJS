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

浏览器打开 [http://localhost:8080](http://localhost:8080)

## Nginx配置

~~~shell script
server {
	listen       		80;
	server_name  		"mingle-test.local.aidalan.com";

 	# minglejs 项目
	location / {
		proxy_pass http://127.0.0.1:8080;
		add_header Access-Control-Allow-Origin *;
	}

	# mock数据 NodeJS jsonp 服务器,对应项目目录，/server/main.js
	location /mock {
		proxy_pass http://127.0.0.1:8081;
		add_header Access-Control-Allow-Origin *;
	}

	access_log off;
	proxy_buffer_size 64k;
	proxy_buffers   4 32k;
	proxy_busy_buffers_size 64k;
	default_type 'text/html';
	charset utf-8;

	set $ACAO '*';
	add_header 'Access-Control-Allow-Origin' '$ACAO';
}
~~~


## 打包部署

项目根目录运行

~~~shell
npm run build
~~~

会生成dist目录， 结构如下

~~~javascript
├── dist
│   ├── chart.min.js
│   ├── index.html
│   ├── index.js
│   ├── main.min.js
│   ├── manifest.min.js
│   └── report.html
~~~

把dist目录部署到服务器后，只需要用scrip标签引入 index.js 即可使用

~~~html
<script src="https://mingle.aidalan.com/index.js"></script>
~~~





## 使用说明

1. 表单组件调用方式为 <input data-fn="form-xxx" />非表单组件则用 <div data-fn="layout-xx"></div>
2. 组件所有属性均通过 <input data-*="属性值"> 组件默认值通过设置 input 上的value值即可
3. 组件均有生命周期

## 模拟数据

本项目提供了Mock数据

直接访问到 http://mingle.local.aidalan.com/mock/ 可以看到所有模拟数据


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



## 表单 和 数据（图表/表格/列表）之间的关联

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



## 样式

`在input中输入style属性，可直接作作用于当前组件的style属性`

在实例化组件之前，获取到style属性的值，然后转换成JSX的style样式。设置进组件内

~~~html
<input data-fn="form-input" style="width:200px" />
~~~

​	

~~~javascript
$('a').click(function(event) {
                        leaveFlag = false;
                        var url = $(this).attr('href');
                        // var jumpdownload = '//hd.aidalan.com/download?downlink='
                        var jumpdownload = '';
                        var host = window.location.host;

                        if (host.includes('wbdd2018')) {
                            jumpdownload = '//hd.wbdd2018.com/download?downlink=';
                        } else {
                            jumpdownload = '//hd.aidalan.com/download?downlink=';
                        }

                        if (url && url != 'javascript:;') {
                            if (browser.versions.mobile) {
                                console.log(url);
                            } else {
                                showQR(url);
                            }
                            stats('down', url);
                            if (browser.versions.android && browser.versions.weixin) {
                                if (false) {
                                    location.href = 'wx.html?down=' + url;
                                    return false;
                                }

                                if (location.search) {
                                    var is_direct = location.search.substr(1);
                                }
                                if (is_direct && is_direct == 'direct') {
                                    location.href = url;
                                } else {
                                    location.href = jumpdownload + url;
                                }

                                return false;
                            }
~~~

