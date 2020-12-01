module.exports = {
    apps: [{
        name: 'mingle-server',      // 服务名称
        script: 'main.js',          // 程序入口
        
        // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
        args: 'one two',
        instances: 1,
        autorestart: true,
        watch: true,
        error_file: '',     // 错误输出日志
        out_file: '',       // 日志
        log_date_format: '',// 日志格式
        cwd: '/Users/ChrisChen/Desktop/MingleJS/server',
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'development',
        },
        env_production: {
            NODE_ENV: 'production',
        },
    }],
    
    deploy: {
        production: {
            user: 'node',
            host: '127.0.0.1',
            // ref: 'origin/master',
            // repo: 'git@github.com:repo.git',
            path: '/var/www/production',
            'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
        },
    },
};