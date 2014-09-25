#!/usr/bin/env node

var path = require('path')
var argv = require('minimist')(process.argv.slice(2));

var src = path.resolve(process.cwd(), argv._[0])
var dst = path.resolve(process.cwd(), argv._[1])
var transforms = [].concat(argv.t, argv.transform).filter(Boolean).map(load)
var ignore = [].concat(argv.ignore, argv.i).filter(Boolean)

require('../index.js')(src, dst, {
    ignore: ignore
  , transforms: transforms
  , remove: argv.r || argv.remove
  , force: argv.f || argv.force
})

function load(file) {
  require(path.resolve(process.cwd(), file))
}
