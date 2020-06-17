const program = require('commander');
const colors = require('colors');

program.version('0.0.1')
       .usage('<command> [options]')
       .command('init [name]', 'init a project')
       .parse(process.argv)


function make_red(txt) {
    return colors.red(txt);
}