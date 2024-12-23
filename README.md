# Codebase Bundler for Grok (CBFG)

A script to bundle codebase files from a directory into bundle(s) to share with Grok 2 AI.

**Disclaimer:** "Codebase Bundler for Grok" is not officially affiliated with or endorsed by xAI, the creators of Grok AI. This project is an open-source tool designed to work with Grok AI but is independently developed and maintained.

## Purpose

This script is designed to consolidate all files from a specified directory into one or more text files. This bundling process is useful for sharing entire codebases with Grok 2 AI for analysis or interaction.

## Usage

To use this script, run:

```
node cbfg.js <directoryToScan> [ignoredItems...]
```

- `<directoryToScan>`: The directory path you want to bundle. It can be relative or absolute.
- [ignoredItems...]: Optional list of directories or files to ignore during the bundling process. 
  - If an item ends with `/`, only the directory with that exact path is ignored.
  - If no `/` is present, both files and directories matching the exact name or path will be ignored.

### Example

To bundle all files in `myProject` except those in `node_modules` and `config.json`:

```
node cbfg.js ./myProject node_modules/ config.json
```

## Features

- **Character Cap & Multiple Bundles**: This script intelligently creates new bundles if necessary to respect Grok's input limits, ensuring no single bundle exceeds 100,000 characters. This is crucial for maintaining system performance and usability when interacting with Grok AI.
- **Ignore Specific Items**: You can specify directories or files to skip during bundling.
- **File Size Limit**: Skips files larger than 100 KB to avoid processing overly large files.

## Output

- Bundled files are generated in the directory where the script is run, named `bundled_codebase_1.txt`, `bundled_codebase_2.txt`, etc.
- Each file contains the content of multiple original files, respecting size and character limits.

## Using the Output

After the bundle files are generated:
1. **Inform Grok** that you will be posting an entire codebase and that Grok should only respond in full when you say you are finished with the code share.
2. **Manually copy and paste** each bundle's content into the prompt of Grok AI for analysis and interaction.

**Remember:** It's your responsibility to stay within sensible boundaries and not to abuse Grok's prompt system by posting excessively large amounts of code at once or in too many parts.

## Notes

- Ensure you have Node.js 14.x or higher installed to run this script.
- Be cautious with large directories as processing might take some time.
- This script does not split files across bundles; each file is included in its entirety in one bundle.

## Important Note

- This content is partially AI-generated.

## License

This project is licensed under the MIT License - see the LICENSE file for details.