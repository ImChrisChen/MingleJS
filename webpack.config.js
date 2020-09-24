const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin'); //打包html的插件
const ImageWebpackPlugin = require('imagemin-webpack-plugin').default;
const FileManagerPlugin = require('filemanager-webpack-plugin');        // 文件处理 https://www.cnblogs.com/1rookie/p/11369196.html
const glob = require('glob');
const marked = require('marked');
const renderer = new marked.Renderer();
// const UglifyEsPlugin = require('uglify-es');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

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
    mode: 'development',
    devtool: isProduction ? false : 'cheap-module-source-map',     // https://www.cnblogs.com/cl1998/p/13210389.html
    entry: {            // 分文件打包
        main: './main.tsx',
        // vendoer: [
        //     'react',
        //     'react-dom',
        //     'antd',
        // ],
        chart: ['bizcharts'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].min.js',
        // publicPath: '/assets/',
        libraryTarget: 'umd',
        chunkFilename: '[name].min.js',//非入口(non-entry) chunk 文件(关联文件)的名称
    },
    optimization: {
        removeAvailableModules: true,
        removeEmptyChunks: true,
        splitChunks: {
            name: 'manifest',     // 自动处理文件名
            chunks: 'all',
            minChunks: 1, // 至少 import 1 次的即需要打包
            automaticNameDelimiter: '-',        // 生成名称的隔离符
            cacheGroups: {
                vendors: {
                    test: /react|react-dom|antd/,   // 将这两个第三方模块单独提取打包
                },
            },
        },
    },
    
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
        alias: {
            '@root': path.resolve(__dirname, './'),
            '@config': path.resolve(__dirname, 'config'),
            '@docs': path.resolve(__dirname, 'docs'),
            '@src': path.resolve(__dirname, 'src'),
            '@component': path.resolve(__dirname, 'src/component/'),
            '@interface': path.resolve(__dirname, 'src/interface/'),
            '@services': path.resolve(__dirname, 'src/services/'),
            '@mock': path.resolve(__dirname, 'src/mock'),
            
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
            // {
            //     test: /\.less$/,
            //     use: [
            //         { loader: 'style-loader' },
            //         { loader: 'css-loader' },
            //         { loader: 'less-loader' },
            //     ],
            // },
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
                // test: /\.tsx?$/,
                test: /(.ts)|(.tsx)$/,
                use: [
                    { loader: 'awesome-typescript-loader' },
                    { loader: 'cache-loader' },
                ],
                include: path.resolve(__dirname, '/'),
                exclude: path.resolve(__dirname, 'node_modules/'),
            },
            // Markdown 文件解析
            // {
            //     test: /.(md|txt)$/,
            //     use: 'raw-loader',
            // },
            {
                test: /.md$/,
                use: [
                    {
                        loader: 'html-loader',
                    },
                    {
                        loader: 'markdown-loader',
                        options: {
                            pedantic: true,
                            renderer,
                        },
                    },
                ],
            },
            { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
            // {
            //     test: /\.jsx?$/,
            //     use: {
            //         loader: 'babel-loader',
            //     },
            // },
        ],
    },
    externals: {        // 忽略打包('直接在Html中引入了，减少打包速度')
        // 'react': 'React',
        // 'react-dom': 'ReactDOM',
        // 'bizcharts': 'bizcharts',
    },
    plugins: [
        
        // new MiniCssExtractPlugin({
        //     // Options similar to the same options in webpackOptions.output
        //     // both options are optional
        //     filename: '[name].[contenthash].css',
        //     disable: isProduction,
        //     chunkFilename: '[id].css',
        // }),
        
        new webpack.WatchIgnorePlugin([/(css)\.d\.ts$/]),
        
        // 处理html
        new HtmlWebpackPlugin({
            // chunks: ['./dist/mingle.min.js'],
            // title: isProduction ? 'MingleJS Production' : 'MingleJS Development',            // html title
            filename: path.resolve(__dirname, 'dist/index.html'),
            template: path.resolve(__dirname, 'public/index.html'),
        }),
        
        // JS压缩 生产环境可以使用这个
        // new UglifyJsPlugin(),
        // new UglifyJsPlugin({
        //     // beautify: false,
        //     // comments: false,
        //     uglifyOptions: {},
        //     cache: true,
        //     sourceMap: !isProduction,
        // }),
        
        // Images 压缩
        new ImageWebpackPlugin({
            test: /\.(jpe?g|png|gif|svg)$/i,
            // disable: process.env.NODE_ENV !== 'production',         // 开发或者生产环境, development 环境期间禁用
            disable: !isProduction,         // 开发或者生产环境, development 环境期间禁用
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
            analyzerMode: 'server',
            analyzerHost: '0.0.0.0',
            // analyzerPort: '9200',
            generateStatsFile: false,
            statsOptions: {
                source: false,
            },
        }),
        
        new FileManagerPlugin({
            onEnd: {
                copy: [
                    {
                        source: './public/index.js',
                        destination: './dist/index.js',
                    },
                ],
            },
        }),
    ],
    devServer: {
        proxy: {
            '/manage': {
                // /manage/useful/advPositionCost/header?pf=1'
                target: 'http://e.aidalan.com/manage',
                // source: true,
                changeOrigin: true,
                pathRewrite: { '^/manage': '' },
            },
            contentBase: path.resolve(__dirname, 'dist/index.html'),   //静态服务器根目录
            compress: true,             // 是否压缩
            host: '0.0.0.0',            // 局域网ip
            // port: 9000,
            historyApiFallback: true,
            open: true,     //是否自动打开默认浏览器
            hot: true,      //热更新
            useLocalIp: true,//是否用自己的IP
            inline: true,//
        },
    },
};

