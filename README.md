**Codebase Bundler for Grok (CBFG) User Documentation**

**Purpose:**
This script bundles all files from a specified directory into one or more text files for sharing with Grok 2 AI. It's designed for consolidating codebases for review or analysis while respecting system limitations.

**How to Use:**

- **Run the Script:**

```
node cbfg.js [directory] [ignored_dirs...] [ignored_files...]
```

- **directory:** Path to the directory you want to bundle. Default is `./` if not specified.
- **ignored_dirs:** Directories to skip (optional).
- **ignored_files:** Specific files to skip (optional, last three arguments).

**Example:**

```
node cbfg.js ./myProject node_modules test.js config.json
```

This will bundle all files in `myProject` except those in `node_modules`, `test.js`, and `config.json`.

**Features:**

- Ignores files or directories if specified.
- Skips files over 100 KB due to per-file size limit.
- **Creates multiple bundles if necessary to avoid hitting Grok's hard limits** on character count, with each bundle capped at 100,000 characters.

**Output:**

- Files named `bundled_codebase_1.txt`, `bundled_codebase_2.txt`, etc., are created in the script's directory, each containing bundled content up to the character limit.

**Using the Output:**

- **After the bundle files are generated, inform Grok that you will be posting an entire codebase and that Grok should only respond in full when you say you are finished with the code share.**
- Then, **manually copy and paste each bundle's content into the prompt of Grok AI** for analysis and interaction.
- **Remember, it's your responsibility to stay within sensible boundaries and not to abuse Grok's prompt system** by posting excessively large amounts of code at once or in too many parts.

**Notes:**

- Ensure you have **Node.js 14.x or higher** installed to run this script
- Be cautious with large directories as it might take time to process.
- Files larger than 100 KB or exceeding the total character limit will be handled by creating additional bundles.

**Feedback & Contributions:**

- If you have any issues or suggestions, please open an issue or contribute via pull requests on GitHub.
- Consider sharing on npm for broader accessibility if open-sourced.

**Important Note:**

- This content is partially AI-generated.
