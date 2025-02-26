const vscode = require('vscode');
const path = require('path');

let lastFolder = null;
let lastLoadedFile = null;

async function findUndotreeJson(filePath,currConfig) {
    if (!vscode.workspace.workspaceFolders) return -1;

    let dir = path.dirname(filePath);
    const workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath; // Root of workspace

    while (dir.startsWith(workspaceFolder)) {
        const jsonUri = vscode.Uri.file(path.join(dir, 'undotree.json'));
        try {
            await vscode.workspace.fs.stat(jsonUri); // Check if file exists

            if (jsonUri.fsPath === lastLoadedFile) {
                const content = await vscode.workspace.fs.readFile(jsonUri);
            const text = new TextDecoder().decode(content); // Convert to string
            const config = JSON.parse(text);
            if(config==currConfig){
                return 0 
            }
                // return 0; // No reload needed if same file
            }

            const content = await vscode.workspace.fs.readFile(jsonUri);
            const text = new TextDecoder().decode(content); // Convert to string
            const config = JSON.parse(text);

            lastLoadedFile = jsonUri.fsPath;
            return config;
        } catch (error) {
            // Ignore errors (file not found, etc.)
        }

        // Move up one directory
        const parentDir = path.dirname(dir);
        if (parentDir === dir) break; // Stop at root
        dir = parentDir;
    }

    return -1; // File not found
}

async function trackEditorChanges(editor, updateConfig, currConfig) {
    if (!editor) return;
    const filePath = editor.document.uri.fsPath;
    const folder = path.dirname(filePath);

    if (folder !== lastFolder) {
        lastFolder = folder;
        const config = await findUndotreeJson(filePath,currConfig);
        if (config !==0 && config !== -1) {
            updateConfig(config);
        }
        console.log("config is :",config)
    }
}




module.exports = { trackEditorChanges };
