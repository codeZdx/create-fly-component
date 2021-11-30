//#region 模块引入及交互配置项
const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");

const TEMPLATE_PATH = "./template"; // 我们的模版文件夹路径
const ROOT_PATH = "./"; //根目录
// 获取模版list
function getTemplateList() {
  const response = fs.readdirSync(TEMPLATE_PATH);
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
//#endregion

inquirer.prompt(questions).then(async (answers) => {
  // #region 创建工作开始前进行校验
  // 组件名称必填
  if (answers.name === "") {
    console.log("Please enter your component name !");
    return;
  }
  // 文件夹名小写，组件名大写
  const componentName = answers.name;
  const firstLetter = componentName.slice(0, 1);
  const dirName = firstLetter.toLowerCase() + componentName.slice(1); // 文件夹
  const fileName = firstLetter.toUpperCase() + componentName.slice(1); // 组件
  // modules模版内容
  let componentArr = [],
    importStr = "",
    ComponentItemStr = "";
  for (let key in answers) {
    if (answers[key] === "Y") {
      componentArr.push(key);
      importStr += `import ${key} from './${key}'\n`;
      ComponentItemStr += `<${key} />`;
    }
  }
  // 判断是否存在同名文件夹
  const componentDirPath = path.join(__dirname, ROOT_PATH, dirName);
  if (fs.existsSync(componentDirPath)) {
    console.log("This componentPath has already been existed !");
    return;
  }
  // 创建目标文件夹
  fs.mkdirSync(componentDirPath);
  // #endregion

  // #region 处理actions、stores文件
  let actionsArr = getTemplateList().filter(
    (c) => c === "actions" || c === "stores"
  );
  actionsArr.forEach((c) => {
    let actionsContent = fs.readFileSync(
      path.join(__dirname, `./template/${c}.js`),
      "utf8"
    );
    let actionsDirPath = path.join(__dirname, `${ROOT_PATH}/${dirName}`, c);
    let actionsFilePath = path.join(
      __dirname,
      `${ROOT_PATH}/${dirName}/${c}`,
      "index.js"
    );
    if (!fs.existsSync(actionsDirPath)) {
      fs.mkdirSync(actionsDirPath); // 创建文件夹
      // 替换输入的组件名称
      actionsContent = actionsContent.replace(/componentName/g, fileName);
      // 写入文件夹中的index.js文件
      fs.writeFile(actionsFilePath, actionsContent, (err) => {
        if (err) console.log(err);
      });
    }
  });
  // #endregion

  // #region 根据保存的用户输入信息创建modules
  let itemDirPath = path.join(__dirname, `${ROOT_PATH}/${dirName}`, "modules");
  if (!fs.existsSync(itemDirPath)) {
    fs.mkdirSync(itemDirPath);
    let itemContent = fs.readFileSync(
      path.join(__dirname, `./template/item.js`),
      "utf8"
    );
    componentArr.forEach((d) => {
      let itemFilePath = path.join(
        __dirname,
        `${ROOT_PATH}/${dirName}/modules`,
        `${d}.js`
      );

      let context = itemContent
        .replace(/componentName/g, fileName)
        .replace(/componentItem/g, d);

      fs.writeFile(itemFilePath, context, (err) => {
        if (err) console.log(err);
      });
    });
  }

  // #endregion

  // #region 处理page组件
  // 处理modules导出文件
  let ComponentStr = componentArr.splice(",");
  let exportStr = `export { ${ComponentStr} }`;
  let componentFilePath = path.join(
    __dirname,
    `${ROOT_PATH}/${dirName}/modules`,
    "index.js"
  );
  let templateContent = fs.readFileSync(
    path.join(__dirname, `./template/component.js`),
    "utf8"
  );
  let templateContext = templateContent
    .replace("importString", importStr)
    .replace("exportString", exportStr);
  fs.writeFile(componentFilePath, templateContext, (err) => {
    if (err) console.log(err);
  });
  // 处理page组件
  let pageFilePath = path.join(
    __dirname,
    `${ROOT_PATH}/${dirName}`,
    "index.js"
  );
  let pageContent = fs.readFileSync(
    path.join(__dirname, `./template/page.js`),
    "utf8"
  );
  let pageContext = pageContent
    .replace(/componentName/g, fileName)
    .replace("ComponentString", ComponentStr)
    .replace("<ComponentItem />", ComponentItemStr);
  fs.writeFile(pageFilePath, pageContext, (err) => {
    if (err) console.log(err);
  });
  // #endregion
});
