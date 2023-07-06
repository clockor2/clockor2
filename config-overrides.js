// https://alchemy.com/blog/how-to-polyfill-node-core-modules-in-webpack-5
const webpack = require('webpack');
const WorkBoxPlugin = require('workbox-webpack-plugin');
const packageData = require('./package.json');

module.exports = function override(config) {
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "assert": require.resolve("assert"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify"),
        "url": require.resolve("url"),
        "process": require.resolve("process/browser")  // this line is changed
    })
    config.resolve.fallback = fallback;
    config.plugins.forEach(plugin => {
        if ( plugin instanceof WorkBoxPlugin.InjectManifest) {
          plugin.config.maximumFileSizeToCacheInBytes = 50*1024*1024;
        }
      });
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer']
        }),
        new webpack.DefinePlugin({
            __VERSION__: JSON.stringify(packageData.version),
        })
    ])
    config.module.rules.push({
        test: /\.m?js/,
        resolve: {
            fullySpecified: false
        }
    })
    return config;
}