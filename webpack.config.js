const webpack = require('atool-build/lib/webpack');
var _extractTextWebpackPlugin = require('extract-text-webpack-plugin');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

module.exports = function(webpackConfig, env) {
  webpackConfig.babel.plugins.push('transform-runtime');

  // Support hmr
  if (env === 'development') {
    // webpackConfig.devtool = '#eval';
    webpackConfig.babel.plugins.push('dva-hmr');
  } /*else {
    webpackConfig.babel.plugins.push('dev-expression');
  }*/

  // Don't extract common.js and common.css
 /* webpackConfig.plugins = webpackConfig.plugins.filter(function(plugin) {
    return !(plugin instanceof webpack.optimize.CommonsChunkPlugin);
  });*/

/*    webpackConfig.babel.plugins.push(['import', [
        {
            "libraryName":"antd",
            style: 'css',  // if true, use less
        }
    ]
    ]);*/

    webpackConfig.babel.plugins.push(['import', [
        {
            "libraryName":"antd",
            style: true,  // if true, use less
        }
    ]
    ]);

  // Support CSS Modules
  // Parse all less files as css module.
  webpackConfig.module.loaders.forEach(function(loader, index) {
    if (typeof loader.test === 'function' && loader.test.toString().indexOf('\\.less$') > -1) {
      loader.include = /node_modules/;
      loader.test = /\.less$/;
    }
    if (loader.test.toString() === '/\\.module\\.less$/') {
      loader.exclude = /node_modules/;
      loader.test = /\.less$/;
    }
    if (typeof loader.test === 'function' && loader.test.toString().indexOf('\\.css$') > -1) {
      loader.include = /node_modules/;
      loader.test = /\.css$/;
    }
    if (loader.test.toString() === '/\\.module\\.css$/') {
      loader.exclude = /node_modules/;
      loader.test = /\.css$/;
      loader.loader=loader.loader.replace(/localIdentName\=\[local\]___\[hash\:base64\:5\]/,'localIdentName=[local]')
    }
   /* if(loader.test.toString() === '/\\.js$/'){
       loader.include = path.join(__dirname, 'node_modules', 'react-data-grid');
       loader.loader = 'babel-loader?presets[]=es2016&presets[]=es2015&presets[]=react!ts-loader'
       }*/
  });

    webpackConfig.externals=Object.assign( {}, webpackConfig.externals,  {
        'g2':'G2',
        'jQuery':'$',
        'js-url': 'url'
    });

    // Load src/entries/*.js as entry automatically.
    const files = glob.sync('./src/entries/*.js');
    const newEntries = files.reduce(function(memo, file) {
        const name = path.basename(file, '.js');
        memo[name] = file;
        return memo;
    }, {});
    webpackConfig.entry = Object.assign({}, webpackConfig.entry, newEntries);

  return webpackConfig;
};
