const {name, version} = require('../../package.json');
const MY_PLATFORM_ENV = process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE'];
const configFile = `${MY_PLATFORM_ENV}/.zqsClirc`;
const defaultConfig = {
    repoType: 'github',
    repos: 'repos',
    owner: 'zqs-cli'
}
module.exports = {
    name,
    version,
    configFile,
    defaultConfig
}