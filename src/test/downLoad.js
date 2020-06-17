let downloadGit = require('download-git-repo');

downloadGit('github:zqs-cli/vue-cli-admin-template#feature/vueTs', 'test/tmp', function (err) {
    console.log(err ? 'Error' : 'Success')
  })