# relocate

## Usage
`relocate test test/unit --remove`
or
`relocate test.js test/unit.js --remove`

### flags
`--remove` or `-r` remove original files after moving
`--ignore` or `-i` ignore file/dir defaults to ignoreing `.git` and `node_modules`
`--transform` or `-t` path to transfrom module.
`--force` or `-f` overwrite existing files

`transform` and `ignore` can be added multiple times
`relocate foo foo/bar -i test -i .git`

### transforms

transfrom paths should point to a moule that exorts a single function.
this function is called with 4 arguments.
* content: the file content
* src: the original file location
* dest: the new file location
* done: callback that must be called with 2 arguments
  * error: an error object or null
  * content: the transformed content

## API

###`relocate(src, dst, options, done)`
* src: the original file location
* dest: the new file location
* options:object
  * force: boolean
  * ignores: array of file or directory names
  * transfroms: array of functions
  * remove: boolean
* done: callback



