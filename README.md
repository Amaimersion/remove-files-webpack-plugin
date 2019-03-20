<h1 align="center">
    Removing of folders and files for Webpack
</h1>

<p align="center">
    A plugin for webpack which removes files and folders before and after compilation.
</p>

## Installation

```javascript
npm install remove-files-webpack-plugin --save-dev
```

## Usage

```javascript
const RemovePlugin = require('remove-files-webpack-plugin');

module.exports = {
    plugins: [
        new RemovePlugin({
            before: {
                // parameters.
            },
            after: {
                // parameters.
            }
        })
    ]
}
```

**Be aware!** You cannot undo deletion of folders/files. Use the `emulate` option if you not sure about correctness of the parameters.

## Parameters

|         Name         |              Type               |   Default   | Description                                                                                                                                          |
| :------------------: | :-----------------------------: | :---------: | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
|         root         |            `String`             | `__dirname` | The root directory. A not absolute paths will appends to this.                                                                                       |
|       include        |         `Array<String>`         |    `[]`     | The folders/fils for remove.                                                                                                                         |
|       exclude        |         `Array<String>`         |    `[]`     | The files for exclude.                                                                                                                               |
|         test         |       `Array<TestObject>`       |    `[]`     | The custom testing.                                                                                                                                  |
|  TestObject.folder   |            `String`             |  Required   | The folder for custom testing.                                                                                                                       |
|  TestObject.method   | `(filePath: String) => Boolean` |  Required   | The method for custom testing.                                                                                                                       |
| TestObject.recursive |            `Boolean`            |   `false`   | Test in all subfolders, not just in TestObject.folder.                                                                                               |
|         log          |            `Boolean`            |   `true`    | Print which folders/files has been removed.                                                                                                          |
|       emulate        |            `Boolean`            |   `false`   | Emulate remove. Print which folders/files will be removed without actually removing them. Ignores `log` value.                                       |
| allowRootAndOutside  |            `Boolean`            |   `false`   | Allow remove the root directory and outside the root directory. It's kinda safe mode. **Don't turn on it if you don't know what you actually want!** |

#### Example how to set these options:

You can pass the options into both `before` and `after` keys. Each key is optional, but at least one should be specified. 

`before` - before compilation, `after` - after compilation.

```javascript
const RemovePlugin = require('remove-files-webpack-plugin');

module.exports = {
    plugins: [
        new RemovePlugin({
            before: {
                include: ['dist']
            },
            after: {
                test: [
                  {
                    folder: 'dist/styles',
                    method: (filePath) => {
                        return new RegExp(/\.map$/, 'm').test(filePath);
                    }
                  } 
                ]
            }
        })
    ]
}
```

## Examples

```javascript
/**
 * Before compilation:
 * - delete the "dist" folder.
 * 
 * After compilation:
 * - remove all css maps in the "dist/styles" folder except the "popup.css.map".
 */

new RemovePlugin({
    before: {
        include: ['dist']
    },
    after: {
        exclude: ['dist/styles/popup.css.map'],
        test: [
            {
                folder: 'dist/styles',
                method: (filePath) => {
                    return new RegExp(/\.map$/, 'm').test(filePath);
                }
            }
        ]
    }
})
```

```javascript
/**
 * After compilation:
 * - remove all css maps in "dist/styles" folder and all subfolders (e.g. "dist/styles/a").
 */

new RemovePlugin({
    after: {
        test: [
            {
                folder: 'dist/styles',
                method: (filePath) => {
                    return new RegExp(/\.map$/, 'm').test(filePath);
                },
                recursive: true
            }
        ]
    }
})
```

```javascript
/**
 * Before compilation:
 * - remove the "manifest.json" file;
 * - remove the "dist/js" folder.
 */

new RemovePlugin({
    before: {
        include: ['dist/manifest.json', 'dist/js']
    }
})
```

```javascript
/**
 * After compilation:
 * - remove all css maps in the "dist/styles" folder;
 * - remove all js maps in the "dist/scripts" folder and all subfolders (e.g. "dist/styles/a").
 */

new RemovePlugin({
    after: {
        test: [
            {
                folder: 'dist/styles',
                method: (filePath) => {
                    return new RegExp(/\.map$/, 'm').test(filePath);
                }
            },
            {
                folder: 'dist/scripts',
                method: (filePath) => {
                    return new RegExp(/\.js.map$/, 'm').test(filePath);
                },
                recursive: true
            }
        ]
    }
})
```

## Issues and requests

Feel free to use [issues](https://github.com/Amaimersion/remove-files-webpack-plugin/issues). [Pull requests](https://github.com/Amaimersion/remove-files-webpack-plugin/pulls) are also always welcome!
