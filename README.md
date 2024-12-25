# Codebase Bundler for Grok (CBFG)

[![NPM](https://img.shields.io/npm/v/cbfg.svg)](https://www.npmjs.com/package/cbfg)

A CLI tool designed specifically for bundling codebase files to share with Grok AI, enhancing readability with markdown formatting.

**Disclaimer:** "Codebase Bundler for Grok" is not officially affiliated with or endorsed by xAI, the creators of Grok AI. This project is an open-source tool designed to work with Grok AI but is independently developed and maintained.

## Installation

To install CBFG globally via npm, run:

```
npm install -g cbfg
```

## Usage

After global installation, use CBFG by running:

```
cbfg <directoryToScan> [ignoredItems...]
```

- `<directoryToScan>`: The directory path you want to bundle. It can be relative or absolute.
- `[ignoredItems...]`: Optional list of files or directories to ignore:
  - `item/` ignores only the directory at that exact path.
  - `item` ignores all files and directories with this name anywhere.
  - Specific files like `src/index.ts` exclude only that file.
  - General names like `node_modules` or scripts ignore all occurrences.
  - Ignoring is case-sensitive.

### Example

To bundle all files in `myProject` except those in `node_modules` and `config.json`:

```
cbfg ./myProject node_modules/ config.json
```

### How to Use the Bundled Code with Grok

After running CBFG:
1. **Inform Grok** you will share a codebase and expect a response only after you've finished.
2. **Find the Bundles**: Look for files named `bundled_codebase_#.txt` in your current directory.
3. **Paste Bundles**: Copy and paste the content of each `.txt` file into Grok AI's input for analysis.

**Warning:** Use responsibly to avoid overwhelming Grok's system.

### Ignoring Strategy

CBFG's ignoring system is both flexible and precise:

- **By Name**: `node_modules` ignores all directories named `node_modules`.
- **By Path**: `src/index.ts` ignores only that specific file.
- **Directories**: `scripts/` or scripts ignores the directory and its contents.

**Note**: 
- Files over 100 KB are automatically ignored.
- Non-UTF-8 encoded files are skipped.

#### Complex Example:

Consider this directory structure:

```
project/
├── src/
│   ├── framework/
│   │   └── dependency-injection/
│   └── index.ts
├── config/
│   └── database.json
├── node_modules/
└── scripts/
```

Running:

```
cbfg ./ node_modules config/database.json scripts src/index.ts dependency-injection
```

- Ignores `node_modules` everywhere.
- Skips `config/database.json`.
- Omits `scripts/` directory.
- Excludes `src/index.ts`.
- Ignores all `dependency-injection` directories.

## Features

- **Grok's Limits**: Creates multiple bundles, capping at 30,000 characters each.
- **Selective Bundling**: Skip specific directories or files.
- **File Size Cap**: Ignores files over 100 KB.
- **Markdown Formatting**: Enhances readability with markdown code blocks.

## Notes

- Requires Node.js 14.x or higher.
- Processing large directories might take time.
- Files are not split across bundles.
- **Development Insight:** This project uses AI assistance for development efficiency.

## License

This project is licensed under the MIT License - see the LICENSE file for details.