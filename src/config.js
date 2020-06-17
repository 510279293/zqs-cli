const fs = require('fs');
const { encode,decode} = require('ini');
const inquirer = require('inquirer');
const {configFile, defaultConfig} = require('./utils/constants');
const {getConfig} = require('./utils/common');
const prompts = [
    {
        type: 'list',
        name: 'repoType',
        message: '设置仓库类型:',
        choices: [
            {
                name: 'gitHub',
                value: 'github'
            },
            {
                name: 'gitLab',
                value: 'gitlab'
            },
            {
                name: 'url',
                value: 'url'
            }
        ]
    }
]
module.exports = async (action) => {
    const obj = getConfig();
    if (!action) { // 查看配置
        Object.keys(obj).forEach(v => {
            console.log(`${v}: ${obj[v]}`)
        })
    } else {
        const willWrite = {}
        if (action === 'set') {
            const {repoType} = await inquirer.prompt([...prompts]);
            Object.assign(willWrite, {repoType})
            if (repoType === 'url') {
                const {romoteUrl} = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'romoteUrl',
                        message: `输入你的远程仓库地址:`,
                    }
                ])
                Object.assign(willWrite, {romoteUrl})
            } else {
                const {owner} = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'owner',
                        message: `仓库owner (repository owner; 不会设置？详情参见: https://developer.github.com/v3/)`,
                        default: obj['owner'] || defaultConfig['owner']
                    }
                ])
                Object.assign(willWrite, {repos: 'repos', owner})
            }
        }
        fs.writeFileSync(configFile, encode(willWrite));
    }
}