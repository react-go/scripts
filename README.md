# @react-go/scripts

[![npm](https://img.shields.io/npm/v/@react-go/scripts?style=flat-square)](https://www.npmjs.com/package/@react-go/scripts)
[![issues](https://img.shields.io/github/issues/react-go/scripts?style=flat-square)](https://github.com/react-go/scripts/issues)
[![pulls](https://img.shields.io/github/issues-pr/react-go/scripts?style=flat-square)](https://github.com/react-go/scripts/pulls)
[![license](https://img.shields.io/github/license/react-go/scripts?style=flat-square)](https://github.com/react-go/scripts/blob/master/LICENSE)

`@react-go/scripts` is a set of configuration and scripts for build React application with zero configuration. It is builds on webpack, Babel, ESLint, webpack-chain etc, and inspired by Create React App, but can be extended and customized without eject.

## Getting Started

Create project directory and initialize:

```shell
$ mkdir react-app
$ cd react-app
$ npm init -y
```

Install `@react-go/scripts` and React:

```shell
# npm
$ npm install @react-go/scripts react react-dom
# yarn
$ yarn add @react-go/scripts react react-dom
```

Create necessary files:

```
react-app
    |-- src
         |-- index.js
    |-- public
         |-- index.html
    |-- package.json
```

you must have `src/index.js` and `public/index.html`.

Add scripts to `package.json`:

```json
{
  "scripts": {
    "start": "react-go start",
    "build": "react-go build"
  }
}
```

then you can run `npm start` to start development server or `npm run build` to builds the app for production.

Please refer to the [React Go docs](https://react-go.github.io/) for more information.

## License

MIT License (c) 2020-preset [pengtikui](https://github.com/pengtikui)

