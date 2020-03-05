const fs = require('fs');
const paths = require('./paths');

const NODE_ENV = process.env.NODE_ENV;
if (!NODE_ENV) {
  throw new Error('The NODE_ENV environment variable is required but was not specified.');
}

const envFiles = [
  `${paths.dotEnv}.${NODE_ENV}`,
  paths.dotEnv,
];

envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    require('dotenv-expand')(
      require('dotenv').config({
        path: file,
      }),
    );
  }
});

const REACT_GO = /^REACT_GO_/;

const getClientEnvironment = () => {
  const raw = Object.keys(process.env)
    .filter(key => REACT_GO.test(key))
    .reduce((env, key) => {
      env[key] = process.env[key];
      return env;
    }, {
      NODE_ENV: process.env.NODE_ENV,
    });

  const stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key]);
      return env;
    }, {}),
  };

  return { raw, stringified };
};

module.exports = getClientEnvironment;
