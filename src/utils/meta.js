const chalk = require('chalk');
module.exports = [
    {
        type: 'input',
        name: 'version',
        message: chalk.grey('项目版本:'),
        default: '1.0.0'
    },
    {
        type: 'input',
        name: 'description',
        message: chalk.grey('项目介绍:'),
    },
    {
        type: 'input',
        name: 'author',
        message: chalk.grey('项目作者:'),
    },
    {
        type: 'input',
        name: 'email',
        message: chalk.grey('作者邮箱:'),
    },
    {
        type: 'input',
        name: 'keywords',
        message: chalk.grey('项目关键词:'),
    },
    {
        type: 'confirm',
        name: 'private',
        message: chalk.grey('私有项目?'),
    },
]