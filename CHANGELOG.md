# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2024-12-22

### Changed
- Fixed an error where private variables were incorrectly accessed outside of their closure in `addToBundle`.
- Simplified the codebase while maintaining functionality.
- Improved the handling of ignored directories and files.

### Fixed
- Correct use of closures for private state management in bundle creation.

## [1.0.1] - 2024-12-22

### Fixed
- Added missing changelog entry for 1.0.1 release.
- This minor update adds a backlink from the npm package to the GitHub repository in `package.json`. No changes to the functionality of CBFG.

## [1.0.0] - 2024-12-22

### Added
- Initial release of Codebase Bundler for Grok (CBFG).
- Script to bundle codebase files from a directory into one or more text files for sharing with Grok AI.
- Support for ignoring specific directories and files.
- Implementation of size limits to prevent overwhelming Grok AI's input capacity.
- User confirmation prompt to ensure safe usage.
- Colored console output for better user experience.
- Documentation on how to use the script, including examples and output management instructions.
- ESLint and Prettier setup for code quality and formatting consistency.
- Husky for Git hooks to enforce code standards before committing or pushing.

[Unreleased]: https://github.com/your-username/cbfg/compare/v1.0.2...HEAD
[1.0.2]: https://github.com/your-username/cbfg/releases/tag/v1.0.2
[1.0.1]: https://github.com/your-username/cbfg/releases/tag/v1.0.1
[1.0.0]: https://github.com/your-username/cbfg/releases/tag/v1.0.0