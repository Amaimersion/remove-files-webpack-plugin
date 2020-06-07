<h1 align="center">
    Removing of folders and files for Webpack
</h1>

<p align="center">
    A plugin for webpack that removes files and folders before and after compilation.
</p>


## Content

- [Content](#content)
- [Installation](#installation)
- [Support](#support)
- [Usage](#usage)
- [Notes for Windows users](#notes-for-windows-users)
  - [Single backward slash](#single-backward-slash)
  - [Segment separator](#segment-separator)
  - [Per-drive working directory](#per-drive-working-directory)
- [Parameters](#parameters)
  - [How to set](#how-to-set)
  - [Namespace](#namespace)
  - [Compilation modes](#compilation-modes)
- [Examples](#examples)
- [Version naming](#version-naming)
- [Contribution](#contribution)
- [License](#license)


## Installation

- With `npm`:
```javascript
npm install remove-files-webpack-plugin
```

- With `yarn`:
```javascript
yarn add remove-files-webpack-plugin
```


## Support

The plugin works on any OS and webpack >= 2.2.0.


## Usage

```javascript
const RemovePlugin = require('remove-files-webpack-plugin');

module.exports = {
    plugins: [
        new RemovePlugin({
            before: {
                // parameters for "before normal compilation" stage.
            },
            watch: {
                // parameters for "before watch compilation" stage.
            },
            after: {
                // parameters for "after normal and watch compilation" stage.
            }
        })
    ]
};
```


## Notes for Windows users

### Single backward slash

JavaScript uses it for escaping. If you want to use backward slash, then use double backward slash. Example: `C:\\Windows\\System32\\cmd.exe`. By the way, single forward slashes are also supported.

### Segment separator

All paths that you get or see from the plugin will contain platform-specific segment separator (i.e. slash): `\\` on Windows and `/` on POSIX. So, for example, even if you passed folders or files with `/` as separator, `TestObject.method` will give you a path with `\\` as segment separator.

### Per-drive working directory

From [Node.js documentation](https://nodejs.org/api/path.html#path_windows_vs_posix):
> On Windows Node.js follows the concept of per-drive working directory. This behavior can be observed when using a drive path without a backslash. For example, `path.resolve('c:\\')` can potentially return a different result than `path.resolve('c:')`. For more information, see [this MSDN page](https://docs.microsoft.com/en-us/windows/win32/fileio/naming-a-file#fully-qualified-vs-relative-paths).


## Parameters

|           Name           |                                             Type                                             |   Default   | Namespace |                                                                                                                                                          Description                                                                                                                                                          |
| :----------------------: | :------------------------------------------------------------------------------------------: | :---------: | :-------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|           root           |                                           `string`                                           |     `.`     |    All    |                                                                                             A root directory.<br>Not absolute paths will be appended to this.<br>Defaults to where `package.json` and `node_modules` are located.                                                                                             |
|         include          |                                          `string[]`                                          |    `[]`     |    All    |                                                                                                                                               A folders or files for removing.                                                                                                                                                |
|         exclude          |                                          `string[]`                                          |    `[]`     |    All    |                                                                                                                                               A folders or files for excluding.                                                                                                                                               |
|           test           |                                        `TestObject[]`                                        |    `[]`     |    All    |                                                                                                                                                    A folders for testing.                                                                                                                                                     |
|    TestObject.folder     |                                           `string`                                           |  Required   |    All    |                                                                                                                                          A path to the folder (relative to `root`).                                                                                                                                           |
|    TestObject.method     |                             `(absolutePath: string) => boolean`                              |  Required   |    All    |                                                                                        A method that accepts an item path (`root` + folderPath + fileName) and<br>returns value that indicates should this item be removed or not.<br>                                                                                        |
|   TestObject.recursive   |                                          `boolean`                                           |   `false`   |    All    |                                                                                                                                       Apply this method to all items in subdirectories.                                                                                                                                       |
|       beforeRemove       | `(`<br>`absoluteFoldersPaths: string[],`<br>`absoluteFilesPaths: string[]`<br>`) => boolean` | `undefined` |    All    | If specified, will be called before removing.<br>Absolute paths of folders and files that<br>will be removed will be passed into this function.<br>If returned value is `true`,<br>then remove process will be canceled.<br>Will be not called if items for removing<br>not found, `emulate: true` or `skipFirstBuild: true`. |
|       afterRemove        |  `(`<br>`absoluteFoldersPaths: string[],`<br>`absoluteFilesPaths: string[]`<br>`) => void`   | `undefined` |    All    |                                                     If specified, will be called after removing.<br>Absolute paths of folders and files<br>that have been removed will be passed into this function.<br>Will be not called if `emulate: true` or `skipFirstBuild: true`.                                                      |
|          trash           |                                          `boolean`                                           |   `false`   |    All    |                                                                                                Move folders and files to the trash (recycle bin) instead of permanent removing.<br>Requires Windows 8+, macOS 10.12+ or Linux.                                                                                                |
|           log            |                                          `boolean`                                           |   `true`    |    All    |                                                                                                                   Print messages of "info" level<br>(example: "Which folders or files have been removed").                                                                                                                    |
|        logWarning        |                                          `boolean`                                           |   `true`    |    All    |                                                                                                                      Print messages of "warning" level<br>(example: "An items for removing not found").                                                                                                                       |
|         logError         |                                          `boolean`                                           |   `false`   |    All    |                                                                                                                          Print messages of "error" level<br>(example: "No such file or directory").                                                                                                                           |
|         logDebug         |                                          `boolean`                                           |   `false`   |    All    |                                                                                                                                   Print messages of "debug" level<br>(used for debugging).                                                                                                                                    |
|         emulate          |                                          `boolean`                                           |   `false`   |    All    |                                                                                            Emulate remove process.<br>Print which folders and files will be removed<br>without actually removing them.<br>Ignores `log` parameter.                                                                                            |
|   allowRootAndOutside    |                                          `boolean`                                           |   `false`   |    All    |                                                                                Allow removing of `root` directory or outside `root` directory.<br>It is kind of safe mode.<br>**Don't turn it on if you don't know<br>what you actually do!**                                                                                 |
| readWebpackConfiguration |                                          `boolean`                                           |   `false`   |    All    |                        Change parameters based on webpack configuration.<br>Following webpack parameters are supported: `stats` (controls logging).<br>These webpack parameters have priority over the plugin parameters.<br>See webpack documentation for more - https://webpack.js.org/configuration                        |
|      skipFirstBuild      |                                          `boolean`                                           |   `false`   |  `watch`  |                                                                                                                                                 First build will be skipped.                                                                                                                                                  |
|   beforeForFirstBuild    |                                          `boolean`                                           |   `false`   |  `watch`  |                                                                                                       For first build `before` parameters will be applied,<br>for subsequent builds `watch` parameters will be applied.                                                                                                       |  |  |  |  |  |

### How to set

You can pass these parameters into any of the following keys: `before`, `watch` or `after`. Each key is optional, but at least one should be specified. 

- `before` – executes once before "normal" compilation.
- `watch` – executes every time before "watch" compilation.
- `after` – executes once after "normal" compilation and every time after "watch" compilation.

### Namespace

"Namespace" means where particular parameter will be applied. For example, "All" means particular parameter will work in any key (`before`, `watch`, `after`), `watch` means particular parameter will work only in `watch` key.

### Compilation modes

- "normal" compilation means full compilation.
- "watch" compilation means first build is a full compilation and subsequent builds is a short rebuilds of changed files. 


## Examples

```javascript
new RemovePlugin({
    /**
     * Before compilation permanently removes
     * entire `./dist` folder.
     */
    before: {
        include: [
            './dist'
        ]
    }
})
```

```javascript
new RemovePlugin({
    /**
     * Every time before "watch" compilation
     * permanently removes `./dist/js/entry.js` file.
     */
    watch: {
        include: [
            './dist/js/entry.js'
        ]
    }
})
```

```javascript
new RemovePlugin({
    /**
     * After compilation moves both 
     * `./dist/manifest.json` file and 
     * `./dist/maps` folder to the trash.
     */
    after: {
        root: './dist',
        include: [
            'manifest.json',
            'maps'
        ],
        trash: true
    }
})
```

```javascript
new RemovePlugin({
    /**
     * Before compilation permanently removes both 
     * `./dist/manifest.json` file and `./dist/maps` folder.
     * Log only works for warnings and errors.
     */
    before: {
        include: [
            'dist/manifest.json',
            './dist/maps'
        ],
        log: false,
        logWarning: true,
        logError: true,
        logDebug: false
    }
})
```

```javascript
new RemovePlugin({
    /**
     * After compilation permanently removes 
     * all maps files in `./dist/styles` folder and 
     * all subfolders (e.g. `./dist/styles/header`).
     */
    after: {
        test: [
            {
                folder: 'dist/styles',
                method: (absoluteItemPath) => {
                    return new RegExp(/\.map$/, 'm').test(absoluteItemPath);
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
     * After compilation:
     * - permanently removes all css maps in `./dist/styles` folder.
     * - permanently removes all js maps in `./dist/scripts` folder and 
     * all subfolders (e.g. `./dist/scripts/header`).
     */
    after: {
        root: './dist',
        test: [
            {
                folder: './styles',
                method: (absoluteItemPath) => {
                    return new RegExp(/\.css\.map$/, 'm').test(absoluteItemPath);
                }
            },
            {
                folder: './scripts',
                method: (absoluteItemPath) => {
                    return new RegExp(/\.js\.map$/, 'm').test(absoluteItemPath);
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
     * Before compilation permanently removes all
     * folders, subfolders and files from `./dist/maps`
     * except `./dist/maps/main.map.js` file.
     */
    before: {
        root: './dist'
        /**
         * You should do like this
         * instead of `include: ['./maps']`.
         */
        test: [
            {
                folder: './maps',
                method: () => true,
                recursive: true
            }
        ],
        exclude: [
            './maps/main.map.js'
        ]
    },

    /**
     * After compilation permanently removes 
     * all css maps in `./dist/styles` folder 
     * except `popup.css.map` file.
     */
    after: {
        test: [
            {
                folder: 'dist/styles',
                method: (absoluteItemPath) => {
                    return new RegExp(/\.css\.map$/, 'm').test(absoluteItemPath);
                }
            }
        ],
        exclude: [
            'dist/styles/popup.css.map'
        ]
    }
})
```

```javascript
new RemovePlugin({
    /**
     * Before "normal" compilation permanently 
     * removes entire `./dist` folder.
     */
    before: {
        include: [
            './dist'
        ]
    },

    /**
     * Every time before compilation in "watch"
     * mode (`webpack --watch`) permanently removes JS files 
     * with hash in the name (like "entry-vqlr39sdvl12.js").
     */
    watch: {
        test: [
            {
                folder: './dist/js',
                method: (absPath) => new RegExp(/(.*)-([^-\\\/]+)\.js/).test(absPath)
            }
        ]
    },

    /**
     * Once after "normal" compilation or every time
     * after "watch" compilation moves `./dist/log.txt`
     * file to the trash.
     */
    after: {
        include: [
            './dist/log.txt'
        ],
        trash: true
    }
})
```

```javascript
new RemovePlugin({
    /**
     * Before compilation emulates remove process
     * for a file that is outside of the root directory.
     * That file will be moved to the trash in case of
     * not emulation.
     */
    before: {
        root: '.', // "D:\\remove-files-webpack-plugin-master"
        include: [
            "C:\\Desktop\\test.txt"
        ],
        trash: true,
        emulate: true,
        allowRootAndOutside: true
    }
})
```

```javascript
new RemovePlugin({
    /**
     * After compilation grabs all files from
     * all subdirectories and decides should
     * remove process be continued or not.
     * If removed process is continued,
     * then logs results with custom logger.
     */
    after: {
        root: './dist',
        test: [
            {
                folder: '.',
                method: () => true,
                recursive: true
            }
        ],
        beforeRemove: (absoluteFoldersPaths, absoluteFilesPaths) => {
            // cancel removing if there at least one folder.
            if (absoluteFoldersPaths.length) {
                return true;
            }

            // cancel removing if there at least one `.txt` file.
            for (const item of absoluteFilesPaths) {
                if (item.includes('.txt')) {
                    return true;
                }
            }
        },
        afterRemove: (absoluteFoldersPaths, absoluteFilesPaths) => {
            // replacing plugin logger with custom logger.
            console.log('Successfully removed:');
            console.log(`Folders – [${absoluteFoldersPaths}]`);
            console.log(`Files – [${absoluteFilesPaths}]`);
        },
        log: false
    }
})
```


## Version naming

This project uses following structure for version naming: `<MAJOR RELEASE>.<BREAKING CHANGES>.<NOT BREAKING CHANGES>`.


## Contribution

Feel free to use [issues](https://github.com/Amaimersion/remove-files-webpack-plugin/issues/new/choose). [Pull requests](https://github.com/Amaimersion/remove-files-webpack-plugin/compare) are also always welcome!


## License

[MIT](https://github.com/Amaimersion/remove-files-webpack-plugin/blob/master/LICENSE).
