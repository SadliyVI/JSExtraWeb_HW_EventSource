import { merge } from "webpack-merge";
import common from "./webpack.common.js";

export default merge(common, {
    mode: "development",
    devtool: "source-map",
    devServer: {
        port: 8080,
        open: true,
        historyApiFallback: true
    }
});