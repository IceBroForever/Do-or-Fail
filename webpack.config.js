
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
        extensions: ['.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                include: path.join(__dirname, 'client')
            },
            {
                test: /\.jsx$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                include: path.join(__dirname, 'client')
            }
        ]
    }
};