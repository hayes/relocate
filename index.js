var through = require('through')
var falafel = require('falafel')
var mkdirp = require('mkdirp')
var ls = require('ls-stream')
var rmrf = require('rimraf')
var path = require('path')
var fs = require('fs')

var isRequire = require('cssauron-falafel')('call>id[name=require] + literal')

module.exports = relocate

function relocate(src, dst, options, done) {
  var transforms = options.transforms || []
  var ignores = (options.ignores && options.ignores.length) ? options.ignores : ['node_modules', '.git']
  var files = []
  var dirs = []
  var index = 0

  transforms.push(update_requires)
  transforms.push(write)

  if(options.remove) {
    transforms.push(remove)
  }

  if(!fs.statSync(src).isDirectory()) {
    if(dst[dst.length - 1 === '/']  || dst[dst.length - 1 === '/']) {
      dst = path.resolve(dst, path.basename(src))
    } else if(fs.existsSync(dst) && fs.statSync(dst).isDirectory()) {
      dst = path.resolve(dst, path.basename(src))
    }

    var srcDir = path.dirname(src)
    mkdirp(path.dirname(dst))
    files.push('')
    start()
  } else {
    mkdirp(dst)
    dirs.push(src)
    ls(src).pipe(through(function(item) {
      if(~ignores.indexOf(path.basename(item.path))) {
        item.ignore()
      } else if(item.stat.isDirectory()) {
        dirs.push(item.path)
      } else {
        files.push(path.relative(src, item.path))
      }
    })).on('end', start)
  }

  function start() {
    if(!files.length) {
      return finished()
    }

    move(files[index++], finished)
  }

  function finished(err) {
    if(err) {
      return done && done(err) && done = null
    } else if(files[index]) {
      return move(files[index++], finished)
    }

    if(options.remove) {
      dirs.forEach(remove.bind(null, null))
    }
    done && done()
  }

  function move(rel, done) {
    var orig = path.resolve(src, rel)
    var dest = path.resolve(dst, rel)
    var i = 0

    mkdirp.sync(path.dirname(dest))
    transforms[i++](fs.readFileSync(orig).toString(), orig, dest, next)

    function next(err, source) {
      if(err) {
        done(err)
      }

      if(transforms[i]) {
        return transforms[i++](source, orig, dest, next)
      }

      done()
    }
  }

  function update_requires(content, orig, dest, done) {
    if(path.extname(orig) !== '.js') {
      return done(null, content)
    }

    var result = falafel(content, function(node) {
      if(node.type === 'Program') {
        return node.update(node.source())
      } else if(!isRequire(node) || node.value[0] !== '.') {
        return
      }

      var loc = path.resolve(path.dirname(orig), node.value)

      if(srcDir) {
        var updated = path.relative(path.dirname(dest), loc)

        if(updated[0] !== '.') {
          updated = './' + updated
        }

        return node.update('\'' + updated + '\'')
      } else if(node.value.lastIndexOf('..', 0) !== 0) {
        return
      }

      var rel = path.relative(srcDir || src, loc)

      if(rel.lastIndexOf('..', 0) === 0) {
        node.update('\'' + path.relative(path.dirname(dest), loc) + '\'')
      }
    })

    done(null, result || content)
  }

  function write(content, orig, dest, done) {
    if(!options.force && fs.existsSync(dest)) {
      return console.log(dest, 'exists, to overwrite use -f or set options.force to true')
    }

    fs.writeFileSync(dest, content)
    done(null, content)
  }


  function remove(content, orig, dest, done) {
    if(orig !== dest && fs.existsSync(orig) && path.relative(orig, dst)[0] === '.') {
      rmrf.sync(orig)
    }

    typeof done === 'function' && done()
  }
}
