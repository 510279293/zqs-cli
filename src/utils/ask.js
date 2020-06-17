const metas = require('./meta');
const inquirer = require('inquirer');
// 项目 package.json 问询模块
module.exports = async () => {
    const answers = await inquirer.prompt([...metas]);
    const {author, email} = answers;
    const obj = {
        author: {
            name: author,
            email
        }
    }
    delete answers.email;
    delete answers.author;
    return Object.assign(obj,answers);
}