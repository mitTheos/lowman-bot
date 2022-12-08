const chalk = require('chalk')

module.exports = {
  name: "error",
  async execute(error){
    console.error(chalk.red(`An error occured with the database connection: \n${error}`));
  }
}