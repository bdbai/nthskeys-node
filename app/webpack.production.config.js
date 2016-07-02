var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');

module.exports = {
    entry: './App.jsx',
    output: {
        path: path.resolve(__dirname, '../static'),
        filename: "bundle.js",
        publicPath: "/static/"
        
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.css', '.ejs']
    },
    module: {
        loaders: [
            { test: /\.js(x)?$/, loader: 'babel', exclude: /node_modules/ },
            { test: /\.css$/, loader: 'style!css', exclude: /node_modules/ }
        ]
    },
    externals: {
        ES6Promise: true,
        React: true,
        ReactDOM: true,
        ReactRouter: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'NthsKeys',
            template: 'index.production.ejs',
            hash: true,
            minify: {
                html5: true,
                collapseInlineTagWhitespace: true,
                collapseWhitespace: true,
                removeComments: true
            },
            BDTJ_ID: process.env.BDTJ_ID
        }),
        new webpack.optimize.UglifyJsPlugin({
            mangle: true
        }),
        new webpack.EnvironmentPlugin(["NODE_ENV", "BDTJ_ID"])
    ]
};
