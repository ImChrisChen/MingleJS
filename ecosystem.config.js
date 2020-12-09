module.exports = {
    apps: [
        {
            name: 'mingle-dev',
            cwd: '/Users/ChrisChen/Desktop/dalan/mingle.aidalan.com',
            script: 'npm run dev',
            // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
            instances: 1,
            autorestart: false,
            watch: false,
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
