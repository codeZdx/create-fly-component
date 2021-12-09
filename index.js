#!/usr/bin/env node
//#region 模块引入及交互配置项
const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const commander = require("commander");

const ora = require("ora");
const spinner = ora("waiting...");

const ROOT_PATH = process.cwd(); //根目录
const enterItems = [
    {
        type: "input",
        name: "name",
        message: "Please enter your component name :",
        require: true,
    },
    {
        type: "input",
        name: "path",
        message: "Please enter your component path ( /src/... ):",
    },
    {
        type: "list",
        name: "Project",
        message: "Which project component do you want to create ?",
        choices: ["FLY", "S9"],
    },
    {
        type: "list",
        name: "Search",
        message: "Do you want to create Search components ?",
        choices: ["Y", "N"],
    },
    {
        type: "list",
        name: "Operate",
        message: "Do you want to create Operate components ?",
        choices: ["Y", "N"],
    },
    {
        type: "list",
        name: "MngTable",
        message: "Do you want to create Table components ?",
        choices: ["Y", "N"],
    },
    {
        type: "list",
        name: "EditDialog",
        message: "Do you want to create EditDialog components ?",
        choices: ["Y", "N"],
    },
];
// 模板内容
const actionsContent = `import Reflux from "reflux";
import PostJSON from "utils/ajax/postJSON";
const componentNameActions = Reflux.createActions({
    search: { asyncResult: true },
});
componentNameActions.search.listen(function (so) {
    PostJSON("", so).then(this.completed, this.failed);
});
export default componentNameActions;`;
const storesContent = `import Reflux from "reflux";
import StateMixin from "reflux-state-mixin";
import { message } from "antd";
import componentNameActions from "../actions";
const componentNameStore = Reflux.createStore({
    mixins: [StateMixin.store],
    listenables: componentNameActions,
    getInitialState: function () {
        return {
            loading: false,
            so: {},
            dataSource: [],
            pageSize: 10,
            currentPage: 1,
            totalSize: 0,
        };
    },
    onSearch(so) {
        this.setState({ so, loading: true });
    },
    onSearchCompleted(result) {
        let volist = [];
        let totalSize = 0;
        if (result.success) {
            volist = result.data || result.voList;
            if (!isArray(volist)) {
                volist = [];
            }
            totalSize = result.count || result.total;
        } else {
            message.error("查询失败:"+result.message);
            volist = [];
            totalSize = 0;
        }
        this.setState({
            loading: false,
            dataSource: volist,
            totalSize,
        });
    },
    onSearchFailed(error) {
        message.error("调用失败:" + error.status);
        this.setState({ loading: false, dataSource: [] });
    },
});
export default componentNameStore;
`;
const itemContent = `import React, { Component } from "react";
import ReactMixin from "react-mixin";
import StateMixin from "reflux-state-mixin";
import { Form } from "antd";
import componentNameActions from "../actions";
import componentNameStore from "../stores";
class componentItem extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return <div></div>;
    }
}
export default Form.create()(
    ReactMixin.onClass(componentItem, StateMixin.connect(componentNameStore))
);`;
const pageContent = `import React, { Component } from "react";
import { ComponentString } from "./modules";
class componentName extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (
            <div id="componentName">
                <ComponentItem />
            </div>
        );
    }
}
module.exports = componentName;`;
const templateContent = `importString;
exportString;`;
//#endregion
commander
    .version("1.0.8", "-v --version")
    .arguments("<init>")
    .action(() => {
        inquirer.prompt(enterItems).then(async (res) => {
            spinner.start();
            // #region 创建工作开始前进行校验
            // 组件名称必填
            if (res.name === "") {
                spinner.stop();
                console.log(chalk.yellow("Please enter your component name !"));
                return;
            }
            // 创建目录地址，没有输入则默认根目录
            const PAGE_PATH = res.path !== "" ? res.path : "./";
            // 文件夹名小写，组件名大写
            const componentName = res.name;
            const firstLetter = componentName.slice(0, 1);
            const dirName = firstLetter.toLowerCase() + componentName.slice(1); // 文件夹
            const fileName = firstLetter.toUpperCase() + componentName.slice(1); // 组件
            // 区分FLY/S9，若是S9，组件以fileName+Search等命名
            const isFly = res.Project === "FLY";
            // modules模版内容
            let componentArr = [],
                importStr = "",
                ComponentItemStr = "";
            for (let key in res) {
                if (res[key] === "Y") {
                    componentArr.push(isFly ? key : fileName + key);
                    importStr += `import ${
                        isFly ? key : fileName + key
                    } from './${key}'\n`;
                    ComponentItemStr += `<${isFly ? key : fileName + key} />`;
                }
            }
            // 判断是否存在同名文件夹
            const componentDirPath = path.join(ROOT_PATH, PAGE_PATH, dirName);
            if (fs.existsSync(componentDirPath)) {
                spinner.stop();
                console.log(
                    chalk.yellow(
                        "This componentPath has already been existed !"
                    )
                );
                return;
            }
            // 创建目标文件夹
            try {
                fs.mkdirSync(componentDirPath);
            } catch (err) {
                spinner.stop();
                console.log(chalk.red(err));
                return;
            }
            // #endregion

            // #region 处理actions、stores文件
            ["actions", "stores"].forEach((c) => {
                const s9ActionName = c === "actions" ? "Actions" : "Stores";
                let actionsDirPath = path.join(
                    ROOT_PATH,
                    `${PAGE_PATH}/${dirName}`,
                    c
                );
                let actionsFilePath = path.join(
                    ROOT_PATH,
                    `${PAGE_PATH}/${dirName}/${c}`,
                    isFly ? "index.js" : `${fileName + s9ActionName}.js`
                );
                if (!fs.existsSync(actionsDirPath)) {
                    try {
                        fs.mkdirSync(actionsDirPath); // 创建文件夹
                    } catch (err) {
                        spinner.stop();
                        console.log(chalk.red(err));
                        return;
                    }
                    // 替换输入的组件名称
                    let actionsContext =
                        c === "actions"
                            ? actionsContent.replace(/componentName/g, fileName)
                            : storesContent.replace(/componentName/g, fileName);
                    // 写入文件夹中的index.js文件
                    fs.writeFile(actionsFilePath, actionsContext, (err) => {
                        if (err) {
                            spinner.stop();
                            console.log(chalk.red(err));
                        }
                    });
                }
            });
            // #endregion

            // #region 根据保存的用户输入信息创建modules
            let itemDirPath = path.join(
                ROOT_PATH,
                `${PAGE_PATH}/${dirName}`,
                "modules"
            );
            if (!fs.existsSync(itemDirPath)) {
                try {
                    fs.mkdirSync(itemDirPath);
                } catch (err) {
                    spinner.stop();
                    console.log(chalk.red(err));
                    return;
                }

                componentArr.forEach((d) => {
                    let itemFilePath = path.join(
                        ROOT_PATH,
                        `${PAGE_PATH}/${dirName}/modules`,
                        `${d}.js`
                    );

                    let context = itemContent
                        .replace(/componentName/g, fileName)
                        .replace(/componentItem/g, d);

                    fs.writeFile(itemFilePath, context, (err) => {
                        if (err) {
                            spinner.stop();
                            console.log(chalk.red(err));
                        }
                    });
                });
            }

            // #endregion

            // #region 处理page组件
            // 处理modules导出文件
            let ComponentStr = componentArr.splice(",");
            let exportStr = `export { ${ComponentStr} }`;
            let componentFilePath = path.join(
                ROOT_PATH,
                `${PAGE_PATH}/${dirName}/modules`,
                "index.js"
            );
            let templateContext = templateContent
                .replace("importString", importStr)
                .replace("exportString", exportStr);
            fs.writeFile(componentFilePath, templateContext, (err) => {
                if (err) {
                    spinner.stop();
                    console.log(chalk.red(err));
                }
            });
            // 处理page组件
            let pageFilePath = path.join(
                ROOT_PATH,
                `${PAGE_PATH}/${dirName}`,
                "index.js"
            );
            let pageContext = pageContent
                .replace(/componentName/g, fileName)
                .replace("ComponentString", ComponentStr)
                .replace("<ComponentItem />", ComponentItemStr);
            fs.writeFile(pageFilePath, pageContext, (err) => {
                if (err) {
                    spinner.stop();
                    console.log(chalk.red(err));
                }
            });
            setTimeout(() => {
                spinner.stop();
                console.log(chalk.green("You have created it successfully !"));
            }, 1000);
            // #endregion
        });
    });
commander.parse(process.argv);
