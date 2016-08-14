const webpack = require('webpack');
const commonConfig = require('./webpack.config.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');

commonConfig.output.publicPath = '/static/';
commonConfig.module.loaders.unshift(
    { test: /\.js(x)?$/, loader: 'babel', exclude: /node_modules/ }
);
commonConfig.plugins.push(
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
        BDTJ_ID: process.env.BDTJ_ID,
        DAOVOICE_ID: process.env.DAOVOICE_ID
    }),
    new webpack.optimize.UglifyJsPlugin({
        mangle: true
    })
);

module.exports = commonConfig;

