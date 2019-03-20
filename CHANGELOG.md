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
