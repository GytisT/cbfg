# Codebase Bundler for Grok (CBFG)

[![NPM](https://img.shields.io/npm/v/cbfg.svg)](https://www.npmjs.com/package/cbfg)

A CLI tool designed specifically for bundling codebase files to share with Grok AI, enhancing readability with markdown formatting.

**Disclaimer:** "Codebase Bundler for Grok" is not officially affiliated with or endorsed by xAI, the creators of Grok AI. This project is an open-source tool designed to work with Grok AI but is independently developed and maintained.

## Purpose

This script consolidates all files from a specified directory into text files formatted for Grok AI, wrapping each file in markdown code blocks for improved readability and analysis.

## Installation

To install CBFG globally via npm, run:

```
npm install -g cbfg
```

## Usage

After global installation, you can use CBFG by running:

```
cbfg <directoryToScan> [ignoredItems...]
```

- `<directoryToScan>`: The directory path you want to bundle. It can be relative or absolute.
- [ignoredItems...]: Optional list of directories or files to ignore during the bundling process. 
  - If an item ends with `/`, only the directory with that exact path is ignored.
  - If no `/` is present, both files and directories matching the exact name or path will be ignored.

### Example

To bundle all files in `myProject` except those in `node_modules` and `config.json`:

```
cbfg ./myProject node_modules/ config.json
```

## Features

- **Respects Grok's Limits**: Creates multiple bundles if needed, capping at 30,000 characters per bundle.
- **Selective Bundling**: Skip specific directories or files.
- **File Size Cap**: Ignores files over 100 KB.
- **Markdown Formatting**: Enhances readability by wrapping file contents in markdown code blocks.

## Output

- Bundled files are named `bundled_codebase_1.txt`, etc., in the current directory, with each file's content in markdown blocks.

## Using the Output

After generating:
1. **Inform Grok** you'll share a codebase and expect a response only after you've finished.
2. **Paste each bundle** into Grok AI's input for analysis.

**Remember:** Use responsibly to avoid overloading Grok's system.

## Notes

- Requires Node.js 14.x or higher.
- Processing large directories might take time.
- Files are not split across bundles.
- **Development Insight:** This project leverages AI assistance in its development for enhanced efficiency and innovation.

## License

This project is licensed under the MIT License - see the LICENSE file for details.