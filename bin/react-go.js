#!/usr/bin/env node

process.on('unhandledRejection', (error) => {
  throw error;
});

const commander = require('commander');
const pkg = require('../package.json');

const program = new commander.Command();

program
  .version(pkg.version)
  .option('-e --app-env [env]', 'Inject to process.env.APP_ENV', 'development');

program
  .command('start')
  .description('run dev server')
  .action(() => require('../scripts/start')(program.opts()));
program
  .command('build')
  .description('build static files')
  .action(() => require('../scripts/build')(program.opts()));

program.parse(process.argv);
