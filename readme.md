# relocate

## Usage
`relocate test test/unit --remove`
or
`relocate test.js test/unit.js --remove`

### flags
* `--remove` or `-r` remove original files after moving
* `--ignore` or `-i` ignore file/dir defaults to ignoring `.git` and `node_modules`
* `--transform` or `-t` path to transform module.
* `--force` or `-f` overwrite existing files

`transform` and `ignore` can be added multiple times
`relocate foo foo/bar -i test -i .git`

### transforms

transform paths should point to a module that exports a single function.
this function is called with 4 arguments.
* content: the file content
* src: the original file location
* dest: the new file location
* done: callback that must be called with 2 arguments
  * error: an error object or null
  * content: the transformed content

## API

###`relocate(src, dest, options, done)`
* src: the original file location
* dest: the new file location
* options: object
  * force: boolean
  * ignores: array of file or directory names
  * transforms: array of functions
  * remove: boolean
* done: callback



