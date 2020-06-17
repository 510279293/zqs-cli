
const inquirer = require('inquirer');
const chalk = require('chalk');
const notifier = require('node-notifier');
const path = require('path');
const ask = require('./utils/ask');
const {
    fnLoadingByOra,
    fetchReopLists,
    getBranchLists,
    downDir,
    exchangeName,
    readFile,
    writeFile,
    autoInstall,
    repoTypeIsUrl
} = require('./utils/common');

const downLoadForUrl = async (projectName) => {
    const {name} = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: '项目名称:',
            default: projectName
        },
    ])
    const reName = await exchangeName(name, projectName);
    const userAnswers = await ask();
    const {isAutoInstall} = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'isAutoInstall',
            message: chalk.grey('是否自动安装项目依赖?'),
            default: false
        },
    ])
    const target = await fnLoadingByOra(downDir, chalk.green('项目下载中...'))('', '', reName, { clone: true });
    return {
        userAnswers,
        isAutoInstall,
        target,
        reName
    }
}
const downLoadForRepos = async (projectName) => {
    let repos = await fnLoadingByOra(fetchReopLists, '正在链接你的仓库...')();
    repos = repos.map((item) => item.name);
    const {repo} = await inquirer.prompt([
        {
            type: 'list',
            name: 'repo',
            message: '请选择一个你要创建的项目模版',
            choices: repos
        }
    ])
    let branchs = await fnLoadingByOra(getBranchLists, `正在查询你的选择的仓库${repo}的分支...`)(repo);
    branchs = branchs.map((item) => item.name);
    const {branch} = await inquirer.prompt([
        {
            type: 'list',
            name: 'branch',
            message: '请选择一个你要创建的项目模版分支',
            choices: branchs
        }
    ])
    const {name} = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: '项目名称:',
            default: projectName
        },
    ])
    // console.log(`i chosed:repos=> ${repos}, branch=> ${branch}, pro-name=> ${name}`);
    const reName = await exchangeName(name, projectName);
    const userAnswers = await ask();
    const {isAutoInstall} = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'isAutoInstall',
            message: chalk.grey('是否自动安装项目依赖?'),
            default: false
        },
    ])
    const target = await fnLoadingByOra(downDir, chalk.green('项目下载中...'))(repo, branch, reName);
    return {
        userAnswers,
        isAutoInstall,
        repo,
        target,
        reName
    }
}

module.exports = async (projectName) => {
    const {userAnswers, isAutoInstall, target, repo, reName} = await (repoTypeIsUrl ?  downLoadForUrl : downLoadForRepos)(projectName);
    if(target) {
        console.log(chalk.green('项目下载完成!'))
        notifier.notify({
            title: 'Node 温馨提示:',
            message: `你所下载的项目模版: ${repo||reName} 已经下载好了,记得回来哦!`
        });
        const oldPackageFile = JSON.parse( await readFile(`${reName}/package.json`) )
        const newPackageFile = Object.assign(oldPackageFile, {name: reName}, userAnswers)
        writeFile(`${reName}/package.json`, JSON.stringify(newPackageFile, null, '\t'))
        const cwd = path.join(process.cwd(), reName);
        isAutoInstall && await autoInstall(cwd, 'npm', chalk.green);
    }
    
}