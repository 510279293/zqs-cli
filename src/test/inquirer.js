const inquirer = require('inquirer');
const propmps = [];

propmps.push(
    {
        type: 'input',
        name: 'name',
        message: '请输入模块名称',
        validate(input){
            if (!input){
                return '不能为空'
            } 
            return true
        }
    },
    {
        type: 'input',
        name: 'description',
        message: '请输入模块描述'
    },
    {
        type: 'list',
            name: 'cssPretreatment',
            message: '想用什么css预处理器呢',
            choices: [
              {
                name: 'Sass/Compass',
                value: 'sass'
              },
              {
                name: 'Less',
                value: 'less'
              }
            ]
    }
)

inquirer.prompt(propmps).then((ans) => {
    console.log(ans)
})