let path = require('path');

module.exports = {
    entry: {
        'bundle': path.join(__dirname, 'client', 'index.jsx'),
    },
    output: {
        path: path.join(__dirname, 'server/public'),
        filename: '[name].js',
        publicPath: '/'
    },
    resolve: {
        extensions: ['.js', '.jsx', '.sass']
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                include: path.join(__dirname, 'client'),
                query: {
                    presets: ['es2015'],
                    plugins: ['syntax-async-functions']
                }
            },
            {
                test: /\.jsx$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                include: path.join(__dirname, 'client'),
                query: {
                    presets: [
                        'es2015',
                        'react'
                    ],
                    plugins: ['syntax-async-functions']
                }
            },
            {
                test: /\.scss$/,
                use: [{
                    loader: "style-loader"
                }, {
                    loader: "css-loader?sourceMap"
                }, {
                    loader: "sass-loader?sourceMap"
                }]
            }
        ]
    }
};