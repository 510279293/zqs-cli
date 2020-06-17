const ora = require('ora');
const axios = require('axios');
const {promisify} = require('util');
// const path = require('path');
// const fse = require('fs-extra');
const fs = require('fs');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { decode} = require('ini');
const spawn = require('child_process').spawn  // 一个node的子线程

let downloadGit = require('download-git-repo');
downloadGit = promisify(downloadGit);// 将项目下载到当前用户的临时文件夹下

const { configFile, defaultConfig } = require('./constants');
const {repoType, owner, romoteUrl } = getConfig();
const repoTypeIsUrl = repoType === 'url';
const BASE_URL = repoTypeIsUrl ? `direct:` : `https://api.github.com`;
// 下载项目
const downDir = async (repo, branch, dest, others = {}) => {
    let project = repoTypeIsUrl ? BASE_URL+romoteUrl : `${repoType}:${owner}/${repo}`; // 下载的项目
    if (branch) {
        project += `#${branch}`;
    }
    // 把项目下载到对应的目录中
    try {
      await downloadGit(project, dest, others);
    } catch (error) {
      console.log(chalk.red('下载错误,原因:\n'),chalk.red(error));
    }
    return dest;
}

const fnLoadingByOra = (fn, message) => async (...argv) => {
    // 封装loading效果
    const spinner = ora(message);
    spinner.start();
    let result = await fn(...argv);
    spinner.succeed(); // 结束loading
    return result;
}

// 1).获取仓库列表
const fetchReopLists = async () => {
    // 获取当前组织中的所有仓库信息,这个仓库中存放的都是项目模板
    const { data } = await axios.get(`${BASE_URL}/orgs/${owner}/repos`)
    .catch(err => {
        console.log(chalk.red(`链接仓库失败，错误信息：${err} \n`));
        return {
            data: undefined
        }
    })
    if (data && Array.isArray(data) && data.lenth === 0) {
        console.log(chalk.yellow(`\n 链接仓库列表为空 \n`));
        return;
    }
    return data
}

// 2).获取仓库 tags
const getTagLists = async (repo) => {
    const {data} = await axios.get(`${BASE_URL}/repos/${owner}/${repo}/tags`)
    .catch(err => {
        console.log(chalk.red(`获取仓库版本信息失败，错误信息：${err} \n`));
        return {
            data: undefined
        }
    })
    if (data && Array.isArray(data) && data.lenth === 0) {
        console.log(chalk.yellow(`\n 仓库版本信息为空 \n`));
        return;
    }
    return data
}

// 3). 获取仓库分支
const getBranchLists = async (repo) => {
    const {data} = await axios.get(`${BASE_URL}/repos/${owner}/${repo}/branches`)
    .catch(err => {
        console.log(chalk.red(`获取仓库分支失败，错误信息：${err} \n`));
        return {
            data: undefined
        }
    })
    if (data && Array.isArray(data) && data.lenth === 0) {
        console.log(chalk.yellow(`\n 仓库分支为空 \n`));
        return;
    }
    return data
}

// 判断当前目录下是否存在相同目录，防止文件覆盖
const hasFolder = (name) => {
    return new Promise(resolve => {
        fs.exists(name,  exists => {
            if (exists) {
                resolve(true);
            } else {
                resolve(false);
            }
        })
    })
}

const exchangeName =  (name, defaultName) => {
    const arr = [];
    const digui = async (name, defaultName) => {
        const ishas = await hasFolder(name);
        if (ishas) {
            const {isReName} = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'isReName',
                    message: chalk.red('该目录下已有该项目,重名项目将会被覆盖,请选择是否继续？'),
                    default: false
                },
            ])
            if (!isReName) {
                const {reName} = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'reName',
                        message: chalk.yellow('请重新输入项目名称:'),
                        default: defaultName
                    },
                ])
                const name = await digui(reName, defaultName);
                await arr.push(name);
                return arr;
            } else {
                return name;
            }
        } else {
            return name;
        }
    }
    return new Promise (resolve => {
        digui(name, defaultName).then(res => {
            const name = Array.isArray(res) ? res[0] : res
            resolve(name)
        });
    })
}

// 读取文件
const readFile = (filePath) => {
    return new Promise(resolve => {
        fs.readFile(`${filePath}`, (err, data) => {
            // const tempObj = JSON.parse(data.toString())
            resolve(data.toString())
        })
    })
}

// 写入文件
const writeFile = (filePath, content) => {
    return new Promise(resolve => {
        fs.writeFile(`${filePath}`, content, (err) => {
            resolve(err)
        })
    })
}

function getConfig(){
    const obj = {};
    const haveConfigFile = fs.existsSync(configFile); //配置文件是否存在
    if (haveConfigFile) {
        const content = fs.readFileSync(configFile,'utf-8');
        const c = decode(content); //将文件内容解析成对象
        Object.assign(obj,c);
    } else {
        Object.assign(obj,defaultConfig);
    }
    return obj;
}

// 自动安装依赖
const autoInstall = (cwd, executable = 'npm', color) => {
    console.log(`\n\n# ${color('正在安装项目依赖 ...')}`)
    console.log('# ========================\n')
    return runCommand(executable, ['install'], {
      cwd,
    })
}

const runCommand = (cmd, args, options) => {
    return new Promise((resolve, reject) => {
        const spwan = spawn(
          cmd,
          args,
          Object.assign(
            {
              cwd: process.cwd(),
              stdio: 'inherit',
              shell: true, // 在shell下执行
            },
            options
          )
        )
        spwan.on('exit', () => {
          resolve()
        })
      })
}

const mapActions = {
    create: {
        alias: 'c', // 别名
        description: '创建一个项目', // 描述
        examples: [ // 用法
            'zqs-cli create <project-name>'
        ]
    },
    delete: {
        alias: 'd',
        description: '删除一个项目',
        examples: [
            'zqs-cli delete <project-name>'
        ],
    },
    list: {
        alias: 'l',
        description: '查看所有项目',
        examples: []
    },
    config: { // 配置文件
        alias: 'conf', // 别名
        description: 'config project variable', // 描述、
        examples: [ // 用法
          'zqs-cli config set',
          'zqs-cli config'
        ]
    },
    '*':{
        alias: '', // 别名
        description: 'command not found', // 描述
        examples: []
    }
}

module.exports = {
    mapActions,
    repoTypeIsUrl,
    fnLoadingByOra,
    getTagLists,
    fetchReopLists,
    getBranchLists,
    downDir,
    hasFolder,
    exchangeName,
    readFile,
    writeFile,
    autoInstall,
    getConfig
}