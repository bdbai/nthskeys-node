var webpack = require('webpack');
var commonConfig = require('./webpack.config.js');
var HtmlWebpackPlugin = require('html-webpack-plugin');

commonConfig.devtool = 'source-map';
commonConfig.module.loaders.unshift(
    { test: /\.js(x)?$/, loader: 'react-hot!babel', exclude: /node_modules/ }
);
commonConfig.plugins.push(
    new HtmlWebpackPlugin({
        title: 'NthsKeys',
        template: 'index.development.ejs',
        hash: true,
        BDTJ_ID: process.env.BDTJ_ID,
        DAOVOICE_ID: process.env.DAOVOICE_ID
    }),
    new webpack.optimize.UglifyJsPlugin()
);

module.exports = commonConfig;
