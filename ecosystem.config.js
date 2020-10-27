module.exports = {
    apps: [
        {
            name: 'build',
            cwd: '/Users/ChrisChen/Desktop/MingleJS',
            script: 'npm run build',
            // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
            instances: 1,
            autorestart: true,
            watch: true,
            max_memory_restart: '2G',
            env: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
            },
        },
    ],
};
