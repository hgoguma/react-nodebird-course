const withBundleAnalyzer = require('@zeit/next-bundle-analyzer');
const webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = withBundleAnalyzer({
    distDir : '.next',
    webpack(config) { //기본적인 next의 설정값이 들어있음
        //console.log('config', config);
        //console.log('rules', config.module.rules[0]);
        const prod = process.env.NODE_ENV === 'production';
        const plugins = [
            ...config.plugins,
            new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /^\.\/ko$/),
        ];
        if(prod) { //배포환경일 때
            plugins.push(new CompressionPlugin()) //파일 확장자에 gz로 바꿈 & 용량을 줄여줌
        }
        return {
            ...config,
            mode: prod ? 'production' : 'development',
            devtool: prod ? 'hidden-source-map' : 'eval',
            module: {
                ...config.module,
                rules: [
                  ...config.module.rules,
                  {
                    loader: 'webpack-ant-icon-loader',
                    enforce: 'pre',
                    include: [
                      require.resolve('@ant-design/icons/lib/dist'),
                    ],
                  },
                ],
            },
            plugins,
        };
    },
});