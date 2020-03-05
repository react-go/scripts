#!/usr/bin/env node

process.on('unhandledRejection', (error) => {
  throw error;
});

const commander = require('commander');
const pkg = require('../package.json');

const program = new commander.Command();

program.version(pkg.version);

program
  .command('start')
  .description('run dev server')
  .action(() => require('../scripts/start')());
program
  .command('build')
  .description('build static files')
  .action(() => require('../scripts/build')());

program.parse(process.argv);
