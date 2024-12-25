#!/usr/bin/env node

/**
 * @fileoverview Codebase Bundler for Grok. A CLI tool to bundle codebase files from a directory into bundle(s) to share with Grok 2 AI.
 * Note: This content is partially AI-generated.
 */

import { readFile, readdir, stat, writeFile, access } from 'node:fs/promises';
import { join, basename, sep } from 'node:path';
import { createInterface } from 'node:readline';

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
const HARD_TOTAL_CHAR_LIMIT = 30000; // Hard limit for total characters
const LOG_EVERY_N_FILES = 100; // Log progress every 100 files
let bundleCount = 0;
let totalCharacters = 0;

/**
 * Asks for user confirmation before proceeding with a potentially dangerous operation.
 * @param {string} message - The confirmation message to display to the user.
 * @returns {Promise<boolean>} A promise that resolves to true if the user confirms, false otherwise.
 */
const confirmAction = async (message) => {
    const rl = createInterface({
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
};

/**
 * Formats file content with path comment and markdown code block.
 * @param {string} filePath - The path of the file.
 * @param {string} content - The content of the file.
 * @returns {string} Formatted content with markdown code block.
 */
const formatFileContent = (filePath, content) =>
    `// File: ${filePath}\n\`\`\`\n${content}\n\`\`\`\n`;

/**
 * Writes the current bundle to a file and resets the bundle.
 * @param {Array<string>} bundle - The content of files in the current bundle.
 */
const writeBundle = async (bundle) => {
    bundleCount++;
    const outputPath = join(
        process.cwd(),
        `bundled_codebase_${bundleCount}.txt`,
    );
    try {
        await writeFile(outputPath, bundle.join(''), 'utf-8');
        totalCharacters += bundle.join('').length;
        colorLog(`Bundle ${bundleCount} written.`, colors.green);
    } catch (writeErr) {
        colorLog(`Error writing bundle ${bundleCount}:`, colors.red, writeErr);
    }
};

/**
 * Manages adding a file to the current bundle or starting a new one if necessary.
 */
const addToBundle = (() => {
    let currentBundle = [];
    let currentChars = 0;

    return {
        add: async (filePath, content) => {
            const formattedContent = formatFileContent(filePath, content);
            const fileChars = formattedContent.length;
            if (currentChars + fileChars > HARD_TOTAL_CHAR_LIMIT) {
                await writeBundle(currentBundle);
                currentBundle = [formattedContent];
                currentChars = fileChars;
            } else {
                currentBundle.push(formattedContent);
                currentChars += fileChars;
            }
        },
        writeCurrentBundle: async () => {
            if (currentBundle.length) {
                await writeBundle(currentBundle);
                currentBundle = [];
                currentChars = 0;
            }
        },
    };
})();

/**
 * Recursively reads files in a directory, ignoring specified directories and files.
 * @param {string} dir - The directory to scan.
 * @param {Array<string>} [ignored=[]] - Items to ignore.
 * @param {string} rootDir - The root directory initially provided by the user.
 * @returns {Promise<number>} A promise resolving to the file count.
 */
const readFiles = async (dir, ignored = [], rootDir) => {
    let fileCount = 0;
    try {
        for (const file of await readdir(dir)) {
            const filePath = join(dir, file);
            const stats = await stat(filePath);

            if (stats.isDirectory()) {
                // Use the whole path for directory checks
                const relativePath = filePath;
                if (
                    !ignored.some((ignoredItem) => {
                        const normalizedItem = ignoredItem.replace(/\/$/, '');
                        const segments = relativePath.split(sep);
                        return segments.some(
                            (segment) =>
                                segment === normalizedItem ||
                                segment === basename(normalizedItem),
                        );
                    })
                ) {
                    fileCount += await readFiles(filePath, ignored, rootDir);
                }
            } else if (
                stats.size <= MAX_FILE_SIZE &&
                !ignored.some((ignoredItem) => {
                    // Check for an exact file match or if the filename alone is listed in ignored
                    const fileName = basename(filePath);
                    return (
                        fileName === ignoredItem ||
                        filePath === ignoredItem ||
                        (ignoredItem.includes('/') &&
                            filePath.startsWith(ignoredItem))
                    );
                })
            ) {
                try {
                    // Attempt to read the file as UTF-8. If successful, add it to the bundle.
                    const content = await readFile(filePath, 'utf-8');
                    await addToBundle.add(filePath, content);
                    fileCount++;
                    if (fileCount % LOG_EVERY_N_FILES === 0)
                        colorLog(
                            `Processed ${fileCount} files...`,
                            colors.green,
                        );
                } catch (error) {
                    // If reading as UTF-8 fails, skip this file
                    if (
                        error instanceof Error &&
                        error.name === 'RangeError' &&
                        error.message.includes('Invalid UTF-8')
                    ) {
                        colorLog(
                            `Skipping file ${filePath} as it is not UTF-8 compatible: ${error.message}`,
                            colors.yellow,
                        );
                    } else {
                        // Log any other error
                        colorLog(
                            `Error reading file ${filePath}: ${error.message}`,
                            colors.red,
                        );
                    }
                }
            } else {
                const sizeKB = (stats.size / 1024).toFixed(2);
                const reason =
                    stats.size > MAX_FILE_SIZE
                        ? `exceeds ${MAX_FILE_SIZE / 1024} KB. File size: ${sizeKB} KB`
                        : 'is in the ignore list.';
                colorLog(
                    `Skipping file ${filePath} as it ${reason}`,
                    colors.yellow,
                );
            }
        }
    } catch (dirErr) {
        colorLog(`Error reading directory ${dir}:`, colors.red, dirErr);
    }
    return fileCount;
};

/**
 * Main execution function to handle CLI input and orchestrate bundling.
 */
const main = async () => {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        colorLog('Usage: cbfg <directoryToScan> [ignore...]', colors.yellow);
        process.exit(1);
    }

    const directoryToScan = args[0];
    const ignored = args.slice(1);

    try {
        await access(directoryToScan);
        const confirmed = await confirmAction(
            `Are you sure you want to scan ${directoryToScan}? (y/n) `,
        );
        if (!confirmed) {
            colorLog('Operation cancelled by user.', colors.red);
            return;
        }

        const finalCount = await readFiles(
            directoryToScan,
            ignored,
            directoryToScan,
        );
        await addToBundle.writeCurrentBundle(); // Write any remaining bundle

        colorLog(
            `Total number of files processed: ${finalCount}`,
            colors.green,
        );
        colorLog(`Bundles written to directory: ${process.cwd()}`, colors.cyan);
        colorLog(
            `Total number of bundles written: ${bundleCount}`,
            colors.green,
        );
        colorLog(
            `Total characters written across all bundles: ${totalCharacters}`,
            colors.green,
        );
        colorLog(
            "Inform Grok you are about to post the entire codebase. Grok should only respond when you say you are finished. Start pasting bundles into Grok's prompt box.",
            colors.yellow,
        );
    } catch {
        colorLog(
            `The specified directory ${directoryToScan} does not exist or cannot be accessed.`,
            colors.red,
        );
        process.exit(1);
    }
};

// Execute the main function, handling any top-level errors
main().catch((err) => {
    colorLog(`An unexpected error occurred: ${err.message}`, colors.red);
    process.exit(1);
});
