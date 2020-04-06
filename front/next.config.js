const withBundleAnalyzer = require('@zeit/next-bundle-analyzer'); 

module.exports = withBundleAnalyzer({
    distDir : '.next',
    webpack(config) { //기본적인 next의 설정값이 들어있음
        console.log('config', config);
        console.log('rules', config.module.rules[0]);
        const prod = process.env.NODE_ENV === 'production';
        return {
            ...config,
            mode: prod ? 'production' : 'development',
            devtool: prod ? 'hidden-source-map' : 'eval',
        };
    },
});