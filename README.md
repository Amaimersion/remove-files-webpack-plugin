<h1 align="center">
    Removing of folders and files for Webpack
</h1>

<p align="center">
    A plugin for webpack which removes files and folders before and after compilation.
</p>


## Installation

- With `npm`:
```javascript
npm install remove-files-webpack-plugin
```

- With `Yarn`:
```javascript
yarn add remove-files-webpack-plugin
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

**Be aware!** You cannot undo deletion of folders or files. Use the `emulate` option if you not sure about correctness of the parameters.


## Parameters

|         Name         |              Type               | Default  | Description                                                                                                                                             |
| :------------------: | :-----------------------------: | :------: | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
|         root         |            `String`             |   `.`    | A root directory. Not absolute paths will be appended to this. Defaults to from which directory is called.                                              |
|       include        |         `Array<String>`         |   `[]`   | A folders or files for removing.                                                                                                                        |
|       exclude        |         `Array<String>`         |   `[]`   | A files for excluding.                                                                                                                                  |
|         test         |       `Array<TestObject>`       |   `[]`   | A folders for custom testing.                                                                                                                           |
|  TestObject.folder   |            `String`             | Required | A path to the folder.                                                                                                                                   |
|  TestObject.method   | `(filePath: String) => Boolean` | Required | A method that accepts an absolute file path and must return boolean value that indicates should be removed that file or not.                            |
| TestObject.recursive |            `Boolean`            | `false`  | Test in all subfolders, not just in `TestObject.folder`.                                                                                                |
|         log          |            `Boolean`            |  `true`  | Print which folders or files has been removed.                                                                                                          |
|       emulate        |            `Boolean`            | `false`  | Emulate remove process. Print which folders or files will be removed without actually removing them. Ignores `log` value.                               |
| allowRootAndOutside  |            `Boolean`            | `false`  | Allow remove of a `root` directory or outside the `root` directory. It's kinda safe mode. **Don't turn it on, if you don't know what you actually do!** |

#### Example how to set these options:

You can pass the options into both `before` and `after` keys. Each key is optional, but at least one should be specified. 

- `before` - executes before compilation; 
- `after` - executes after compilation.

```javascript
const RemovePlugin = require('remove-files-webpack-plugin');

module.exports = {
    plugins: [
        new RemovePlugin({
            /**
             * Before compilation removes entire `dist` folder.
             */
            before: {
                include: ['dist']
            },

            /**
             * After compilation removes all files in `dist/styles` folder,
             * that have `.map` type.
             */
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
new RemovePlugin({
    /**
     * Before compilation removes entire `dist` folder.
     */ 
    before: {
        include: ['dist']
    },

    /**
     * After compilation removes all css maps 
     * in `dist/styles` folder except `popup.css.map` file.
     */
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
new RemovePlugin({
    /**
     * After compilation removes all css maps in 
     * `dist/styles` folder and all subfolders 
     * (e.g. `dist/styles/header`).
     */
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
new RemovePlugin({
    /**
     * Before compilation removes `manifest.json` file and 
     * removes `js` folder.
     */
    before: {
        root: './dist',
        include: ['manifest.json', 'js']
    }
})
```

```javascript
new RemovePlugin({
    /**
     * After compilation:
     * - removes all css maps in `dist/styles` folder.
     * - removes all js maps in `dist/scripts` folder and 
     * all subfolders (e.g. `dist/scripts/header`).
     */
    after: {
        root: './dist',
        test: [
            {
                folder: './styles',
                method: (filePath) => {
                    return new RegExp(/\.map$/, 'm').test(filePath);
                }
            },
            {
                folder: './scripts',
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
