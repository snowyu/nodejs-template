// package-scripts.js is a convention used by the 'nps' utility
// It's like package.json scripts, but more flexible.
// const { concurrent, series, runInNewWindow, rimraf } = require('nps-utils')
const { series, rimraf } = require('nps-utils')

// const pkg = require('./package.json')

const transpile =
  'babel --config-file ./.babelrc.js --out-dir lib --ignore __tests__,__mocks__ src'
const cleanDist = rimraf('lib')

// const retry = n => cmd =>
//   Array(n)
//     .fill(`(${cmd})`)
//     .join(' || ')
// const retry3 = retry(3)

const quote = cmd =>
  cmd.replace(new RegExp('\'', 'g'), '\\\'').replace(new RegExp('"', 'g'), '\\"')

const optional = cmd =>
  `(${cmd}) || echo "Optional command '${quote(cmd)}' failed".`

// const timeout = n => cmd => `timeout -t ${n}m -- ${cmd}`
// const timeout5 = timeout(5)

module.exports = {
  scripts: {
    clean: {
      default: {
        description: 'clear the libs folder',
        script: cleanDist
      },
    },
    build: {
      default: {
        description: 'deletes the `lib` directory and transpiles all relevant `src` to the `lib`',
        script: series(cleanDist, transpile, 'nps build.ts'),
      },
      ts: 'tsc lib/**/*.js --declaration --allowJs --emitDeclarationOnly --outDir types',
      watch: 'nps "build --watch"'
    },
    test: {
      default: 'jest --runInBand --config .jest.config.js',
      cov: 'nps "test --coverage"',
      watch: 'nps "test --watchAll"',
      coveralls: 'nps test.cov && cat ./.coverage/lcov.info | coveralls'
    },
    lint: {
      default: 'npx eslint --config .eslintrc.js .',
      fix: optional('nps "lint --fix"')
    },
    docs: {
      description: 'generate the API Document',
      default: series('nps build', 'jsdoc2md -c .jsdoc.json lib/**/*.js > api.md'),
      html: {
        description: 'generate the API HTML Document',
        script: series('nps build', 'npx jsdoc -c .jsdoc.json')
      }
    },
  }
};
