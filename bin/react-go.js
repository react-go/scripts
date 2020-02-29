#!/usr/bin/env node

process.on('unhandledRejection', (error) => {
  throw error;
});

const commander = require('commander');
const pkg = require('../package.json');
const start = require('../scripts/start');
const build = require('../scripts/build');

const program = new commander.Command();

program.version(pkg.version);

program
  .command('start')
  .description('run dev server')
  .action(start);
program
  .command('build')
  .description('build static files')
  .action(build);

program.parse(process.argv);
