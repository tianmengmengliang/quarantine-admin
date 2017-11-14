const cfg = {
            "entry": "./src/entries/*.js",
            "disableCSSModules": false,
            "publicPath": "/",
            "theme": {
                "@primary-color": "#1DA57A",
                    "@link-color": "#1DA57A",
                    "@border-radius-base": "2px",
                    "@font-size-base": "16px",
                    "@line-height-base": "1.2"
            },
            "autoprefixer": null,
            "proxy": {
                "/api": {
                        "target": "http://jsonplaceholder.typicode.com/",
                            "changeOrigin": true,
                            "pathRewrite": { "^/api" : "" }
                }
            },
            "extraBabelPlugins": [
                "transform-runtime",
                ["import", { "libraryName": "antd", "style": true }]
            ],
            "env": {
                "development": {
                    "extraBabelPlugins": [
                        "dva-hmr"
                    ]
                }
            }
};

export default cfg;