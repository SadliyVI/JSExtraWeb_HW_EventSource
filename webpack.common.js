import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import Dotenv from "dotenv-webpack";

export default {
    entry: path.resolve("src/index.js"),
    output: {
        path: path.resolve("dist"),
        filename: "bundle.[contenthash].js",
        clean: true
    },
    plugins: [
        new HtmlWebpackPlugin({ template: path.resolve("src/index.html") }),
        new Dotenv({ systemvars: true })
    ],
    module: {
        rules: [
            { test: /\.css$/i, use: ["style-loader", "css-loader"] },
            { test: /\.(png|jpg|jpeg|gif|svg)$/i, type: "asset/resource" }
        ]
    }
};