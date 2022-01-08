#!/usr/bin/env node
//#region 模块引入及交互配置项
const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const commander = require("commander");

const ora = require("ora");
const spinner = ora("waiting...");

const TEMPLATE_PATH = __dirname + "/template"; // 我们的模版文件夹路径
const ROOT_PATH = process.cwd(); //根目录
// 获取模版list
function getTemplateList() {
    const response = fs.readdirSync(TEMPLATE_PATH);
    return response.map((item) => {
        return item.substring(0, item.lastIndexOf("."));
    });
}
const enterItems = [
    {
        type: "input",
        name: "name",
        message: "Please enter your component name :",
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
//#endregion
commander
    .version("1.0.9", "-v --version")
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
            let actionsArr = getTemplateList().filter(
                (c) => c === "actions" || c === "stores"
            );
            actionsArr.forEach((c) => {
                let actionsContent = fs.readFileSync(
                    path.join(__dirname, `/template/${c}.js`),
                    "utf8"
                );
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
                    actionsContent = actionsContent.replace(
                        /componentName/g,
                        fileName
                    );
                    // 写入文件夹中的index.js文件
                    fs.writeFile(actionsFilePath, actionsContent, (err) => {
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

                let itemContent = fs.readFileSync(
                    path.join(__dirname, `/template/item.js`),
                    "utf8"
                );
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
            let templateContent = fs.readFileSync(
                path.join(__dirname, `/template/component.js`),
                "utf8"
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
            let pageContent = fs.readFileSync(
                path.join(__dirname, `/template/page.js`),
                "utf8"
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
