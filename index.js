const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");

const COMPONENT_PATH = "./template"; // 我们的模版文件夹路径
const ROOT_PATH = "./"; //根目录
function getTypeList() {
    const response = fs.readdirSync(COMPONENT_PATH);
    return response.map((item) => {
        return item.substring(0, item.lastIndexOf("."));
    });
}

const questions = [
    {
        type: "input",
        name: "name",
        message: "Please enter your component name :",
        require: true,
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

inquirer.prompt(questions).then(async (answers) => {
    // 组件名称必填
    if (answers.name === "") {
        console.log("Please enter your component name !");
        return;
    }
    // 文件夹名小写，组件名大写
    const componentName = answers.name;
    const firstLetter = componentName.slice(0, 1);
    const dirName = firstLetter.toLowerCase() + componentName.slice(1);
    const fileName = firstLetter.toUpperCase() + componentName.slice(1);
    // modules组件内容
    let componentArr = [];
    for (let key in answers) {
        if (answers[key] === "Y") componentArr.push(key);
    }
    // 判断是否存在同名文件夹
    const componentDirPath = path.join(__dirname, ROOT_PATH, dirName);
    if (fs.existsSync(componentDirPath)) {
        console.log("This componentPath has already been existed !");
        return;
    }
    // 目标文件夹
    fs.mkdirSync(componentDirPath);
    // 处理模板文件
    const templateList = getTypeList();
    let targetDirPath, targetFilePath;
    templateList.forEach((c) => {
        let templateContent = fs.readFileSync(
            path.join(__dirname, `./template/${c}.js`),
            "utf8"
        );
        // 创建actionsm,stores
        if (c === "actions" || c === "stores") {
            targetDirPath = path.join(__dirname, `${ROOT_PATH}/${dirName}`, c);
            targetFilePath = path.join(
                __dirname,
                `${ROOT_PATH}/${dirName}/${c}`,
                "index.js"
            );
            if (!fs.existsSync(targetDirPath)) {
                fs.mkdirSync(targetDirPath); // 创建文件夹
                templateContent = templateContent.replace(
                    /componentName/g,
                    fileName
                );
                fs.writeFile(targetFilePath, templateContent, (err) => {
                    if (err) console.log(err);
                });
            }
        }

        // 根据用户输入创建modules
        if (c === "item") {
            targetDirPath = path.join(
                __dirname,
                `${ROOT_PATH}/${dirName}`,
                "modules"
            );
            fs.mkdirSync(targetDirPath);
            componentArr.forEach((d) => {
                targetFilePath = path.join(
                    __dirname,
                    `${ROOT_PATH}/${dirName}/modules`,
                    `${d}.js`
                );

                let context = templateContent
                    .replace(/componentName/g, fileName)
                    .replace(/componentItem/g, d);

                fs.writeFile(targetFilePath, context, (err) => {
                    if (err) console.log(err);
                });
            });
        }
        if (c === "page") {
            targetFilePath = path.join(
                __dirname,
                `${ROOT_PATH}/${dirName}`,
                "index.js"
            );
            let ComponentStr = componentArr.splice(",");
            let ComponentItemStr = "";
            componentArr.forEach((c) => {
                ComponentItemStr += `<${c} />\n`;
            });

            let context = templateContent
                .replace(/componentName/g, fileName)
                .replace("ComponentString", ComponentStr)
                .replace("<ComponentItem/>", ComponentItemStr);

            console.log(ComponentItemStr, context);
            fs.writeFile(targetFilePath, context, (err) => {
                if (err) console.log(err);
            });
        }
    });
});
