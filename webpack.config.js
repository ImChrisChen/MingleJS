const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // css 分离
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;   // 打包分析
const HtmlWebpackPlugin = require('html-webpack-plugin');           //打包html的插件
const ImageWebpackPlugin = require('imagemin-webpack-plugin').default;
const FileManagerPlugin = require('filemanager-webpack-plugin');        // 文件处理 
const glob = require('glob');
const clc = require('cli-color');
const webpack = require("webpack");
const browserify = require('browserify')

let env = process.env.NODE_ENV;
let isProduction = env !== 'development';
let isDoc = env === 'production-doc';
let isLib = env === 'production-lib';

console.log('当前环境:', env);
console.log(clc.blue(`-------------是否生产环境: ${isProduction}-------------`));

module.exports = {
    watchOptions: {
        ignored: /node_modules/,
        aggregateTimeout: 300,
        poll: 1000,  //每秒询问次数，越小越好
    },
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'cheap-module-source-map' : 'cheap-module-source-map',     // https://www.cnblogs.com/cl1998/p/13210389.html
    entry: {            // 分文件打包
        // [name]是对应的入口文件的key, [name].js 就是main.js
        main: isLib ? './main.prod.ts' : './main.tsx',    // https://webpack.js.org/guides/code-splitting/ // vendoer: [
    },
    output: {
        path: path.resolve(__dirname, isDoc ? 'dist' : 'lib'),
        filename: '[name].min.js',
        library: {
            type: "umd"
        },
        chunkFilename: '[name].min.js',//非入口(non-entry) chunk 文件(关联文件)的名称
    },
    optimization: {
        removeAvailableModules: true,
        removeEmptyChunks: true,
        splitChunks: {
            name: 'manifest',     // 自动处理文件名
            chunks: 'all',
            minSize: 30000,
            minChunks: 1, // 至少 import 1 次的即需要打包
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            automaticNameDelimiter: '-',        // 生成名称的隔离符
            cacheGroups: {
                vendors: {
                    test: /react|react-dom|antd|jquery/,
                    priority: -10,
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true,
                },
            },
        },
    },
    performance: {      // webpack 打包性能提示
        hints: 'warning',
        //入口起点的最大体积
        maxEntrypointSize: 50000000,
        //生成文件的最大体积
        maxAssetSize: 30000000,
        //只给出 js 文件的性能提示
        assetFilter: function (assetFilename) {
            return assetFilename.endsWith('.js');
        },
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
        alias: {
            '@root': path.resolve(__dirname, './'),

            '@src': path.resolve(__dirname, 'src'),
            '@component': path.resolve(__dirname, 'src/component'),
            '@interface': path.resolve(__dirname, 'src/interface'),
            '@services': path.resolve(__dirname, 'src/services'),
            '@mock': path.resolve(__dirname, 'server/mock'),

            '@public': path.resolve(__dirname, 'public'),

            '@static': path.resolve(__dirname, 'static'),

            '@images': path.resolve(__dirname, 'static/images'),
            '@utils': path.resolve(__dirname, 'src/utils'),

        },
        modules: [path.resolve(__dirname, 'node_modules')],
        fallback: {
            path: require.resolve("path-browserify"),
        }
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [
                    isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                    {loader: 'css-loader'},
                ],
            },
            {
                test: /\.less$/,
                use: [
                    isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                    {loader: 'css-loader'},
                    {
                        loader: 'less-loader',
                        options: {
                            // javascriptEnabled: true,
                            // lessOptions: { // 如果使用less-loader@5，请移除 lessOptions 这一级直接配置选项。
                            modifyVars: {
                                dark: true, // 开启暗黑模式
                                compact: true, // 开启紧凑模式
                                // 'primary-color': '#f38ce4',　　//修改antd主题色
                            },
                            javascriptEnabled: true,
                        },
                        // },
                    },
                ],
            },
            {
                test: /\.scss$/,
                include: path.resolve('src/'),
                use: [
                    isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                    {
                        loader: 'typings-for-css-modules-loader',
                        options: {
                            modules: true,
                            namedExport: true,
                            camelCase: true,
                            sass: true,
                            localIdentName: '[name]__[local]__[hash:4]',
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true,
                        },
                    },
                ],
            },
            {
                test: /\.tsx?$/,
                use: [
                    {loader: 'ts-loader'},
                ],
                include: path.resolve(__dirname, '/'),
                exclude: path.resolve(__dirname, 'node_modules/'),
            },
            // Markdown 文件解析(raw 不会把 markdown 解析成 html)
            {
                test: /.(md|txt|html)$/,
                use: 'raw-loader',
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: 'assets/[name].[ext]',
                    },
                },
            },
            {enforce: 'pre', test: /\.js$/, loader: 'source-map-loader'},
        ],
    },

    // TODO 格式 { 'package包名称' : 'script标签引入全局变量名称' },
    externals: {        // 忽略打包('直接在Html中引入了，减少打包速度')
        // 'antd': 'antd',      // TODO 目前分离无效
        'highlight.js': 'hljs',
        '@antv/data-set': 'DataSet',
        '@ant-design/icons': 'icons',
        'jquery': '$',
        'react': 'React',
        'react-dom': 'ReactDOM',
        'bizcharts': 'BizCharts',
        'gg-editor': 'gg-editor',
    },
    plugins: [

        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),

        new webpack.HotModuleReplacementPlugin(),

        // 处理html
        new HtmlWebpackPlugin({
            title: isProduction ? 'MingleJS Production' : 'MingleJS Development',            // html title
            // filename: path.resolve(__dirname, 'dist/index.html'),
            template: './public/index.html',
        }),

        new MiniCssExtractPlugin({
            filename: '[name].css',     // main.css
            // minimize: true,
            // disable: isProduction,
            chunkFilename: '[name].css', // manifest.css
        }),

        // Images 压缩
        new ImageWebpackPlugin({
            test: /\.(jpe?g|png|gif|svg)$/i,
            // disable: process.env.NODE_ENV !== 'production',         // 开发或者生产环境, development 环境期间禁用
            // disable: !isProduction,         // 开发或者生产环境, development 环境期间禁用
            disable: true,         // 开发或者生产环境, development 环境期间禁用
            pngquant: {
                quality: '10-80',
            },
            optipng: {
                optimizationLevel: 9,
            },
            externalImages: {
                context: 'src',
                sources: glob.sync('static/images'),
                destination: path.resolve(__dirname, 'dist/images'),
                fileName: '[path].[name].[ext]',
            },
        }),

        // webpack 打包性能可视化分析
        new BundleAnalyzerPlugin({
            analyzerMode: isProduction ? 'static' : false,  // 生成html文件
            generateStatsFile: false,
            statsOptions: {
                source: false,
            },
        }),

        new FileManagerPlugin({
            events: {
                onEnd: {
                    copy: [
                        {
                            source: './public/index.js',
                            destination: `./${isDoc ? 'dist' : 'lib'}/index.js`,
                        },
                        {
                            source: './public/data-set.js',
                            destination: `./${isDoc ? 'dist' : 'lib'}/data-set.js`
                        }
                    ],
                },
            },
        }),
    ],
    devServer: {
        host: '0.0.0.0',
        port: 9000,
        open: true,     //是否自动打开默认浏览器
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:9001',
                source: true,
                changeOrigin: true,
                pathRewrite: {'^/api': '/'},
            },
            contentBase: path.resolve(__dirname, '/'),   //静态服务器根目录
            // compress: true,             // 是否压缩
            headers: {
                'X-Content-Type-Options': 'nosniff',
                'Access-Control-Allow-Origin': '*'
            },
        },
        // https: true,
        firewall: false,        // 已解决 [webpack-dev-server] Invalid Host/Origin header
        // allowedHosts: ['mingle-test.local.aidalan.com'],
        // disableHostCheck: true,
    },
    cache: {
        type: "filesystem",
        buildDependencies: {
            config: []
        },
        version: "1.0"
    },
    stats: {
        errorDetails: true
    },
    target: 'web'
};

