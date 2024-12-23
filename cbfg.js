/**
 * @fileoverview Codebase Bundler for Grok. A script to bundle codebase files from a directory into bundle(s) to share with Grok 2 AI.
 * Note: This content is partially AI-generated.
 */

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

// ANSI Colors
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

// Wrapper for console.log with color support
const colorLog = (message, color = colors.reset) =>
    console.log(`${color}${message}${colors.reset}`);

const MAX_FILE_SIZE = 100 * 1024; // 100 KB per file limit
const HARD_TOTAL_CHAR_LIMIT = 100000; // Hard limit for total characters
const LOG_EVERY_N_FILES = 100; // Log progress every 100 files
let bundleCount = 0;
let totalCharacters = 0;

/**
 * Asks for user confirmation before proceeding with a potentially dangerous operation.
 * @param {string} message - The confirmation message to display to the user.
 * @returns {Promise<boolean>} A promise that resolves to true if the user confirms, false otherwise.
 */
function confirmAction(message) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) =>
        rl.question(`${colors.yellow}${message}${colors.reset}`, (answer) => {
            rl.close();
            resolve(
                answer.trim().toLowerCase() === 'y' ||
                    answer.trim().toLowerCase() === 'yes',
            );
        }),
    );
}

/**
 * Recursively reads files in a directory, ignoring specified directories and files.
 * @param {string} dir - The directory to scan.
 * @param {Object} [options={}] - Options for ignoring directories and files.
 * @param {Array<string>} [options.ignoredDirs=[]] - Directories to ignore.
 * @param {Array<string>} [options.ignoredFiles=[]] - Files to ignore by name.
 * @param {number} [fileCount=0] - Count of files successfully read.
 * @returns {Promise<number>} A promise resolving to the file count.
 */
async function readFiles(
    dir,
    { ignoredDirs = [], ignoredFiles = [] } = {},
    fileCount = 0,
) {
    try {
        const files = await fs.readdir(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stats = await fs.stat(filePath);

            if (stats.isDirectory()) {
                if (
                    !ignoredDirs.some((ignored) => filePath.startsWith(ignored))
                ) {
                    fileCount = await readFiles(
                        filePath,
                        { ignoredDirs, ignoredFiles },
                        fileCount,
                    );
                }
            } else if (
                !ignoredFiles.includes(path.basename(file)) &&
                stats.size <= MAX_FILE_SIZE
            ) {
                try {
                    const content = await fs.readFile(filePath, 'utf-8');
                    const fileData = `// File: ${filePath}\n${content}\n\n`;
                    await addToBundle(fileData);
                    fileCount++;
                    if (fileCount % LOG_EVERY_N_FILES === 0)
                        colorLog(
                            `Processed ${fileCount} files...`,
                            colors.green,
                        );
                } catch (readErr) {
                    colorLog(
                        `Error reading file ${filePath}:`,
                        colors.red,
                        readErr,
                    );
                }
            } else {
                const sizeKB = (stats.size / 1024).toFixed(2);
                colorLog(
                    `Skipping file ${filePath} as it ${stats.size > MAX_FILE_SIZE ? `exceeds ${MAX_FILE_SIZE / 1024} KB. File size: ${sizeKB} KB` : 'is in the ignore list.'}`,
                    colors.yellow,
                );
            }
        }
    } catch (dirErr) {
        colorLog(`Error reading directory ${dir}:`, colors.red, dirErr);
    }
    return fileCount;
}

/**
 * Manages adding a file to the current bundle or starting a new one if necessary.
 * @param {string} fileData - The content of the file to add.
 */
async function addToBundle(fileData) {
    addToBundle.currentBundle ??= [];
    addToBundle.currentChars ??= 0;
    const fileChars = fileData.length;
    if (addToBundle.currentChars + fileChars > HARD_TOTAL_CHAR_LIMIT) {
        await writeBundle(addToBundle.currentBundle);
        addToBundle.currentBundle = [fileData];
        addToBundle.currentChars = fileChars;
    } else {
        addToBundle.currentBundle.push(fileData);
        addToBundle.currentChars += fileChars;
    }
}

/**
 * Writes the current bundle to a file and resets the bundle.
 * @param {Array<string>} bundle - The content of files in the current bundle.
 */
async function writeBundle(bundle) {
    bundleCount++;
    const outputPath =
        process.env.OUTPUT_PATH ||
        path.join(__dirname, `bundled_codebase_${bundleCount}.txt`);
    try {
        await fs.writeFile(outputPath, bundle.join(''), 'utf-8');
        totalCharacters += addToBundle.currentChars;
        addToBundle.currentBundle = [];
        addToBundle.currentChars = 0;
        colorLog(`Bundle ${bundleCount} written.`, colors.green);
    } catch (writeErr) {
        colorLog(`Error writing bundle ${bundleCount}:`, colors.red, writeErr);
    }
}

/**
 * Processes the given directory, collecting file contents into one or more bundled files.
 * @param {string} directoryPath - The path to the directory to scan.
 * @param {Object} [options={}] - Options for ignoring directories and files.
 * @param {Array<string>} [options.ignoredDirs] - Array of directory paths to ignore.
 * @param {Array<string>} [options.ignoredFiles] - Array of file names to ignore.
 */
async function processDirectory(
    directoryPath,
    { ignoredDirs = [], ignoredFiles = [] } = {},
) {
    const confirmed = await confirmAction(
        `Are you sure you want to scan ${directoryPath}? (y/n) `,
    );
    if (!confirmed) {
        colorLog('Operation cancelled by user.', colors.red);
        return;
    }

    const finalCount = await readFiles(directoryPath, {
        ignoredDirs: ignoredDirs.map((dir) => path.join(directoryPath, dir)),
        ignoredFiles,
    });
    if (addToBundle.currentBundle?.length)
        await writeBundle(addToBundle.currentBundle);

    colorLog(`Total number of files processed: ${finalCount}`, colors.green);
    colorLog(`Bundles written to directory: ${__dirname}`, colors.cyan);
    colorLog(`Total number of bundles written: ${bundleCount}`, colors.green);
    colorLog(
        `Total characters written across all bundles: ${totalCharacters}`,
        colors.green,
    );
    colorLog(
        "Inform Grok you are about to post the entire codebase. Grok should only respond when you say you are finished. Start pasting bundles into Grok's prompt box.",
        colors.yellow,
    );
}

if (require.main === module) {
    (async () => {
        const [directoryToScan, ...args] = process.argv.slice(2);
        const [ignoredDirs, filesToIgnore] = [
            args.slice(0, -3),
            args.slice(-3),
        ];

        try {
            await fs.access(directoryToScan || './');
            await processDirectory(directoryToScan || './', {
                ignoredDirs,
                ignoredFiles: filesToIgnore,
            });
        } catch {
            colorLog(
                'The specified directory does not exist or cannot be accessed.',
                colors.red,
            );
            process.exit(1);
        }
    })();
}
