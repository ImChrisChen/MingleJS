const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const HtmlWebpackPlugin = require('html-webpack-plugin'); //打包html的插件

const typingsForCssModulesLoaderConf = {
    loader: 'typings-for-css-modules-loader',
    options: {
        modules: true,
        namedExport: true,
        camelCase: true,
        sass: true,
    },
};

module.exports = {
    mode: 'production',
    devtool: 'inline',
    entry: './main.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: './mingle.min.js',
        // publicPath: '/assets/',
        libraryTarget: 'umd',
    },
    // optimization: {
    //     splitChunks: {
    //         name: false,     // 自动处理文件名
    //         chunks: 'all',
    //         minChunks: 1, // 至少 import 1 次的即需要打包
    //         automaticNameDelimiter: '-',        // 生成名称的隔离符
    //         cacheGroups: {
    //             vendors: {
    //                 test: /react|react-dom|antd/,   // 将这两个第三方模块单独提取打包
    //                 chunks: 'initial',
    //             },
    //         },
    //     },
    // },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
        alias: {
            '@src': path.resolve(__dirname, 'src'),
            '@component': path.resolve(__dirname, 'src/component/'),
            '@interface': path.resolve(__dirname, 'src/interface/'),
            '@services': path.resolve(__dirname, 'src/services/'),
            
            '@public': path.resolve(__dirname, 'public/'),
            
            '@static': path.resolve(__dirname, 'static/'),
            
            '@images': path.resolve(__dirname, 'static/images'),
            '@utils': path.resolve(__dirname, 'utils'),
        },
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' },
                ],
            },
            {
                test: /\.less$/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' },
                    { loader: 'less-loader' },
                ],
            },
            {
                test: /\.scss$/,
                rules: [
                    {
                        use: [
                            'style-loader',
                            typingsForCssModulesLoaderConf,
                        ],
                    },
                ],
            },
            {
                test: /\.tsx?$/,
                use: {
                    // loader: 'ts-loader',
                    loader: 'awesome-typescript-loader',
                },
            },
            { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
            {
                test: /\.jsx?$/,
                use: {
                    loader: 'babel-loader',
                },
            },
        ],
    },
    externals: {        // 忽略打包('直接在Html中引入了，减少打包速度')
        // 'react': 'React',
        // 'react-dom': 'ReactDOM',
        // 'bizcharts': 'bizcharts',
    },
    plugins: [
        
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: '[name].[contenthash].css',
            disable: process.env.NODE_ENV === 'development',
            chunkFilename: '[id].css',
        }),
        
        new webpack.WatchIgnorePlugin([/css\.d\.ts$/]),
        
        // 处理html
        new HtmlWebpackPlugin({
            // chunks: ['./dist/mingle.min.js'],
            filename: path.join(__dirname, 'dist/index.html'),
            template: './public/index.html',
        }),
        
        // webpack 打包性能可视化分析
        // new BundleAnalyzerPlugin({
        //     analyzerMode: 'server',
        //     analyzerHost: '0.0.0.0',
        //     analyzerPort: '9200',
        //     generateStatsFile: true,
        //     statsOptions: {
        //         source: false,
        //     },
        // }),
    ],
    devServer: {
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                source: true,
                changeOrigin: true,
                pathRewrite: { '^/api': '' },
            },
            contentBase: path.join(__dirname, './dist/'),   //发布目录
            compress: true,             // 是否压缩
            host: '0.0.0.0',            // 局域网ip
            port: 9000,
            historyApiFallback: true,
            open: true,     //是否自动打开默认浏览器
            hot: true,      //热更新
            useLocalIp: true,//是否用自己的IP
            inline: true,//
        },
    },
};

