const path = require('path');
const HTMLPlugin = require('html-webpack-plugin');

module.exports = [
    {
        mode: 'development',
        node: {
            __dirname: false,
        },
        target: 'electron-main',
        entry: {
            main: './src/main/index.ts',
            preload: './src/preload/preload.ts',
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].js',
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader',
                }
            ],
            // fix socket.io warnings
            noParse: [path.resolve(__dirname, 'node_modules/ws')],
        },
        // fix socket.io warnings
        externals: ['ws'],
        resolve: {
            extensions: ['.js', '.ts', '.tsx', '.jsx', '.json'],
        },
    },
    {
        mode: 'development',
        target: 'electron-renderer',
        entry: {
            index: './src/renderer/index.ts',
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].js',
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader',
                }
            ]
        },
        resolve: {
            extensions: ['.js', '.ts', '.tsx', '.jsx', '.json'],
        },
        plugins: [
            new HTMLPlugin(),
        ],
    },
];
