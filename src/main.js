const program = require('commander');
const {version} = require('./utils/constants');
const { mapActions} = require('./utils/common');
const path = require('path')

Reflect.ownKeys(mapActions).forEach((action) => {
    program.command(action) // 配置命令的别名
           .alias(mapActions[action].alias) // 命令的别名
           .description(mapActions[action].description) // 命令对应的描述
           .action(() => {
               if (action === '*') {
                console.log(mapActions[action].description); 
               } else {
                   // 分解命令 到文件里 有多少文件 就有多少配置 create config
                   // lee-cli create project-name ->[node,lee-cli,create,project-name]
                   // console.log(process.argv);
                   require(path.join(__dirname, action))(...process.argv.slice(3))
               }
           })
})
    
// 监听用户的 help 事件       
program.on('--help', () => {
    console.log('\n Examples:');
    Reflect.ownKeys(mapActions).forEach((action) => {
        mapActions[action].examples.forEach((example) => {
            console.log(`${example}`)
        })
    })
})

program.version(version)
       .parse(process.argv); // process.argv就是用户在命令行中传入的参数

