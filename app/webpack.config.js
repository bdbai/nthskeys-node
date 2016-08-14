const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HashOutputPlugin = require('./HashOutputPlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: './App.jsx',
    output: {
        path: path.resolve(__dirname, '../static'),
        filename: "bundle.js"
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.css', '.ejs']
    },
    module: {
        loaders: [
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
        new webpack.EnvironmentPlugin(["NODE_ENV", "BDTJ_ID", "DAOVOICE_ID"]),
        new HashOutputPlugin(path.join(__dirname, '../static', 'version.json')),
        new CopyWebpackPlugin([
            {
                'from': './assets/logo.png'
            },
            {
                'from': './assets/cache.manifest'
            }
        ])
    ]
}

