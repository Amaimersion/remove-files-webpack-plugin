# 1.4.3 (June 7, 2020)

## Added

- Information about version naming in README.
- New feature: `readWebpackConfiguration`. Part of plugin configuration may be controlled with global webpack configuration. [#29](https://github.com/Amaimersion/remove-files-webpack-plugin/issues/29)


# 1.4.2 (May 15, 2020)

## Improved

- Little refactoring (related to English language, not information) of documentation and log messages. [#27](https://github.com/Amaimersion/remove-files-webpack-plugin/issues/27)


# 1.4.1 (April 25, 2020)

## Improved

- Documentation for `beforeRemove`, `afterRemove` parameters.

## Added

- Namespace documentation for every parameter.
- New feature: `beforeForFirstBuild`. For first build `before` parameters will be applied, for subsequent builds `watch` parameters will be applied. Works only in `watch` key. [#25](https://github.com/Amaimersion/remove-files-webpack-plugin/issues/25)
- New feature: `skipFirstBuild`. First build will be skipped. Works only in `watch` key.

## Changed

- Upgrade `@types/webpack` dependency to `4.41.12` version.


# 1.4.0 (February 27, 2020)

## Added

- New key: `watch`. Parameters of that key will be applied in "watch" mode. **Parameters of `before` key will no longer be applied in "watch" mode. So, make sure your current configuration still have expected behavior.** [#22](https://github.com/Amaimersion/remove-files-webpack-plugin/issues/22)

## Fixed

- A bug when old `include` and old `exclude` were mixed with new `include` and `exclude` in "watch" mode. It had no effect, because the plugin checks an items for existence before removing. Just strange messages were presented in warning log.


# 1.3.0 (February 24, 2020)

## Improved

- Stability, performance and quality.
- Documentation and description.
- Pretty printing of folders and files that have been removed.

## Added

- New features: `beforeRemove` and `afterRemove` parameters. See [readme](https://github.com/Amaimersion/remove-files-webpack-plugin#parameters) for documentation.

## Changed

- `trash` parameter is `false` by default.
- `TestObject.method` supports testing for folders. **Ensure that behavior of your current tests remain unchanged.**

## Fixed

- A bug when safety of removal could have been incorrectly determined in specific cases.
- A bug when "unnecessary" folders and files could have been incorrectly excluded in specific cases.
- A bug when `exclude` could not work as expected in specific cases.


# 1.2.2 (January 19, 2020)

## Fixed

- A bug when root path was escaped incorrectly. [#16](https://github.com/Amaimersion/remove-files-webpack-plugin/issues/16)


# 1.2.1 (December 25, 2019)

## Added

- Type definitions. [#13](https://github.com/Amaimersion/remove-files-webpack-plugin/issues/13)


# 1.2.0 (December 23, 2019)

## Improved

- Stability and quality.
- Documentation and description.

## Added

- New feature: `trash`. Now you can remove your items in a trash (recycle bin).
- New features: `logWarning`, `logError` and `logDebug`. Now you can control logging of different levels. [#10](https://github.com/Amaimersion/remove-files-webpack-plugin/issues/10)

## Changed

- Text of log messages.

## Fixed

- A bug when safety of removal was incorrectly determined. [#7](https://github.com/Amaimersion/remove-files-webpack-plugin/issues/7)
- A bug when the plugin not worked in `--watch` mode. [#9](https://github.com/Amaimersion/remove-files-webpack-plugin/issues/9)
- A bug when a path could be incorrectly changed for pretty printing.
- A bug when unnecessary items could be cropped incorrectly.


# 1.1.3 (May 10, 2019)

## Fixed

- Fix a bug when folder path in warning message was `undefined`. [#5](https://github.com/Amaimersion/remove-files-webpack-plugin/issues/5).


# 1.1.2 (April 4, 2019)

## Fixed

- Fix compatibility with webpack 3.x [#3](https://github.com/Amaimersion/remove-files-webpack-plugin/issues/3).


# 1.1.1 (March 20, 2019)

Nothing changed. Had to change the version because of problems with `npm`. See changelog for 1.1.0 version.


# 1.1.0 (March 20, 2019)

## Fixed

- No longer necessary set `__dirname` to `root` in order to specify an actual root directory.
- If you not set `include` and `test` parameters, there will be no more message `An items for removing not found.`. 

## Changed

- Plugin name that used in terminal now contains a version.
- If `allowRootAndOutside` option is off, then in terminal a paths will be printed without the root.
- Improved cross-platform properties.
- Improved readability of log messages.

## Added

- Add a link to README to error message which appears in case you do not specify neither `before` nor `after` parameters.
- Add a warning message if `allowRootAndOutside` option is on and if there is unsafe removing.


# 1.0.0 (June 5, 2018)

Initial release.
