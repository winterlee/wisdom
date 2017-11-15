var webpack = require('webpack');
var path = require('path');
var os = require('os');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
var UglifyJsParallelPlugin = require('webpack-uglify-parallel');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var merge = require('webpack-merge');

var postcssConfigPath = path.resolve(__dirname, './postcss.config.js');
var postcssLoader = {
	loader: 'postcss-loader',
	options: {
		config: {
			path: postcssConfigPath
		}
	}
};

module.exports = function(paramObj) {

	var commonDir =  path.resolve(__dirname);
	var htmlTitle = paramObj.htmlTitle;
	var htmlFileURL = paramObj.htmlFileURL;
	var appDir = paramObj.appDir;
	var uglify = paramObj.uglify;
	var cssDir = paramObj.appDir.replace(/^js/, 'css');
	var imgDir = paramObj.appDir.replace(/^js/, 'img');
	var mockDir = paramObj.appDir.replace(/^js/, 'mock');
	var hash = paramObj.hash;
	var htmlTpl = paramObj.htmlTpl||'baseTpl.html';

	var hashFileName = hash?'[name]_' + hash:'[name]_[hash:8]';
	

	var baseTplUrl = path.join(commonDir, htmlTpl);
	var staticFileDir = path.resolve(commonDir, '../../dist');
	


	var obj = {};

	obj.entry = {
		app: './js/control',
	};


	obj.output = {
		filename: hashFileName+'.min.js',
		path: path.join(staticFileDir, appDir),
		publicPath: '../../' + path.join(appDir , '/')
	};

    obj.resolve = {
        extensions: ['.js', '.juicer', '.json', '.vue']
    };

	obj.module = {
		rules: [{
			test: /\.juicer$/,
			loader: 'juicer-loader',
		}, {
			test: /\.less$/,
			use: ExtractTextPlugin.extract({
				fallback: 'style-loader',
				use: [
					'css-loader',
                    postcssLoader,
					'less-loader'
				]
			})
		}, {
			test: /\.css$/,
			use: ExtractTextPlugin.extract({
				fallback: 'style-loader',
				use: [
					'css-loader',
                    postcssLoader
				]
			})
		}, {
			test: /\.(png|jpe?g|gif|svg)$/,
			use: [{
				loader: 'url-loader',
				query: {
					limit: 10000,
					name: path.join(path.relative(appDir, imgDir), hashFileName +'.[ext]')
				}
			}]
		}, {
			test: /\.mock$/,
			use: [{
				loader: 'file-loader',
				query: {
					name: path.join(path.relative(appDir, mockDir), hashFileName + '.[ext]')
				}
			}]
		}, {
            test: /\.(js|es|es6)$/,
            use: [
                {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['es2015', {modules: false, loose: true}]
                        ],
                        cacheDirectory: true
                    }
                }
            ],
            exclude: /node_modules/
        }, {
            test: /\.vue$/,
            use: [
                {
                    loader: 'vue-loader'
                }
            ]
        }]
	};

	var pluginsArr = [
        new CleanWebpackPlugin([appDir, cssDir, mockDir], {
            root: staticFileDir,
            verbose: true
        }),

		new HtmlWebpackPlugin({
			title: htmlTitle,
			filename: path.join(staticFileDir, htmlFileURL),
			template: baseTplUrl
		}),

		new ExtractTextPlugin({
			filename: path.join(path.relative(appDir, cssDir), hashFileName + '.min.css')
		})
	];

	obj.plugins = pluginsArr;

	if (uglify) {
		pluginsArr.push(new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false,
				drop_console: false,
				drop_debugger: true
        
			}
		}));
    // pluginsArr.push(new UglifyJsParallelPlugin({
    //     workers: os.cpus().length,
    //     mangle: true,
    //     compressor: {
    //         warnings: false,
    //         drop_console: false,
    //         drop_debugger: true
    //     }
    // }));
		pluginsArr.push(new OptimizeCSSPlugin({
			cssProcessorOptions: {
	        // 避免 cssnano 重新计算 z-index
	        safe: true
	    }
		}));
	}

	return obj;
};