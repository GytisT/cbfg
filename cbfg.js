#!/usr/bin/env node
/**
 * @fileoverview Codebase Bundler for Grok. A script to bundle codebase files from a directory into bundle(s) to share with Grok 2 AI.
 * Note: This content is partially AI-generated.
 */

import { readFile, readdir, stat, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';
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
function confirmAction(message) {
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
}

/**
 * Adds a file path comment.
 * @param {string} filePath - The path of the file.
 * @returns {string} The file path comment.
 */
function addFilePathComment(filePath) {
    return `// File: ${filePath}\n`;
}

/**
 * Wraps content with markdown code block formatting.
 * @param {string} content - The content to wrap.
 * @returns {string} The content wrapped in markdown code block.
 */
function wrapWithMarkdown(content) {
    return `\`\`\`\n${content}\n\`\`\`\n`;
}

/**
 * Recursively reads files in a directory, ignoring specified directories and files.
 * @param {string} dir - The directory to scan.
 * @param {Array<string>} [ignored=[]] - Items to ignore.
 * @param {number} [fileCount=0] - Count of files successfully read.
 * @returns {Promise<number>} A promise resolving to the file count.
 */
async function readFiles(dir, ignored = [], fileCount = 0) {
    try {
        const files = await readdir(dir);
        for (const file of files) {
            const filePath = join(dir, file);
            const stats = await stat(filePath);

            if (stats.isDirectory()) {
                if (
                    !ignored.some((ignoredItem) => {
                        return (
                            (ignoredItem.endsWith('/') &&
                                filePath === ignoredItem.slice(0, -1)) || // Exact directory match when suffixed with /
                            ignoredItem === filePath
                        );
                    })
                ) {
                    fileCount = await readFiles(filePath, ignored, fileCount);
                }
            } else if (
                !ignored.some(
                    (ignoredItem) =>
                        ignoredItem === file || // Exact file match for non-directory items
                        ignoredItem === filePath, // Exact path match for files or directories without trailing slash
                ) &&
                stats.size <= MAX_FILE_SIZE
            ) {
                try {
                    const content = await readFile(filePath, 'utf-8');
                    await addToBundle(filePath, content); // Pass filePath and content separately
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
                let reason =
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
}

/**
 * Manages adding a file to the current bundle or starting a new one if necessary.
 * @param {string} filePath - The path of the file being added.
 * @param {string} content - The content of the file to add.
 */
async function addToBundle(filePath, content) {
    addToBundle.currentBundle ??= [];
    addToBundle.currentChars ??= 0;

    const commentedContent =
        addFilePathComment(filePath) + wrapWithMarkdown(content);

    const fileChars = commentedContent.length;
    if (addToBundle.currentChars + fileChars > HARD_TOTAL_CHAR_LIMIT) {
        await writeBundle(addToBundle.currentBundle);
        addToBundle.currentBundle = [commentedContent];
        addToBundle.currentChars = fileChars;
    } else {
        addToBundle.currentBundle.push(commentedContent);
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
        join(process.cwd(), `bundled_codebase_${bundleCount}.txt`); // Write to current working directory
    try {
        await writeFile(outputPath, bundle.join(''), 'utf-8');
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
 * @param {Array<string>} [ignored=[]] - Items to ignore.
 */
async function processDirectory(directoryPath, ignored = []) {
    const confirmed = await confirmAction(
        `Are you sure you want to scan ${directoryPath}? (y/n) `,
    );
    if (!confirmed) {
        colorLog('Operation cancelled by user.', colors.red);
        return;
    }

    const finalCount = await readFiles(directoryPath, ignored);
    if (addToBundle.currentBundle?.length)
        await writeBundle(addToBundle.currentBundle);

    colorLog(`Total number of files processed: ${finalCount}`, colors.green);
    colorLog(`Bundles written to directory: ${process.cwd()}`, colors.cyan); // Use current working directory for output location
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

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        colorLog(
            'Usage: cbfg <directoryToScan> [ignoredItems...]',
            colors.yellow,
        );
        process.exit(1);
    }

    const directoryToScan = args[0];
    const ignored = args.slice(1);

    try {
        await access(directoryToScan);
        await processDirectory(directoryToScan, ignored);
    } catch {
        colorLog(
            `The specified directory ${directoryToScan} does not exist or cannot be accessed.`,
            colors.red,
        );
        process.exit(1);
    }
}

main().catch((err) => {
    colorLog(`An unexpected error occurred: ${err.message}`, colors.red);
    process.exit(1);
});
