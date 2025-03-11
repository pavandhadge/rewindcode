const vscode = require('vscode');
const path = require('path');
const { setConfig } = require("./configStore");

let lastFolder = null;
let lastLoadedFile = null;

async function findUndotreeJson(filePath) {
    if (!vscode.workspace.workspaceFolders) return -1;

    let dir = path.dirname(filePath);
    const workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;

    while (dir.startsWith(workspaceFolder)) {
        const jsonUri = vscode.Uri.file(path.join(dir, 'undotree.json'));
        try {
            await vscode.workspace.fs.stat(jsonUri);
            const content = await vscode.workspace.fs.readFile(jsonUri);
            const text = new TextDecoder().decode(content);
            const newConfig = JSON.parse(text);

            if (jsonUri.fsPath === lastLoadedFile) {
                return 0; // No update needed
            }

            lastLoadedFile = jsonUri.fsPath;
            setConfig(newConfig);
            return 1; // Config updated
        } catch (error) {
            // Ignore errors, but log for debugging
            console.error(`Error reading config file: ${error.message}`);
        }

        const parentDir = path.dirname(dir);
        if (parentDir === dir) break;
        dir = parentDir;
    }

    return -1;
}

async function trackEditorChanges(editor) {
    if (!editor) return;
    const filePath = editor.document.uri.fsPath;
    const folder = path.dirname(filePath);

    if (folder !== lastFolder) {
        lastFolder = folder;
        return await findUndotreeJson(filePath);
    }
    return 0;
}

module.exports = { trackEditorChanges };
