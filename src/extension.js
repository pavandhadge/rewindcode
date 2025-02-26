
const vscode = require('vscode');
const UndoTreeProvider = require('./undotreeprovider.js');
const UndoTree = require('./undotree.js');
const {trackEditorChanges} = require("./configManager.js")
const {parseJsUsingSWC} = require("./javascript/parser.js")
// import { parseJsUsingSWC } from './javascript/parser.js';


let config = {}; // Store config in memory
let language = null;
let framework = null;
let funcRecommendation = null;


// Function to update config and dependent variables
function setConfig(newConfig) {

}

function activate(context) {


    const treeDataProvider = new UndoTreeProvider();


    



    // Register a command to update the UndoTree when the active text editor changes
    vscode.window.onDidChangeActiveTextEditor(async (editor) => {
        if (editor) {
            await trackEditorChanges(editor, (newConfig) => {
                
                config = newConfig;

                // Update dependent variables
             language = newConfig?.["language"] || null;
             framework = newConfig?.["framework"] || null;
               funcRecommendation = newConfig?.["func-recommendation"] || null;
            
                console.log("Config updated:", config);
                console.log("language settings :", language);
                console.log("framework settings :", framework);
                console.log("func recommendation settings : ",funcRecommendation)
            });
           
            treeDataProvider.getUndoTreeForActiveEditor();
            treeDataProvider.refresh();
        }
    });



            // Initial load
            if (vscode.window.activeTextEditor) {
                trackEditorChanges(vscode.window.activeTextEditor, (newConfig) => {
                    config = newConfig;
                });
            }
        
            // Command to check config
            context.subscriptions.push(
                vscode.commands.registerCommand('extension.showConfig', () => {
                    vscode.window.showInformationMessage('Config: ' + JSON.stringify(config));
                })
            );

    // Register commands


    context.subscriptions.push(
        vscode.commands.registerCommand('undotree.undo', () => {
            const undoTree = treeDataProvider.getUndoTreeForActiveEditor();
            if (!undoTree) return;
            const text_buff = vscode.window.activeTextEditor?.document.getText() || '';
            if (text_buff !== undoTree.getCurrentNode().state) {
                undoTree.addState(text_buff);
            }
            undoTree.undo();
            treeDataProvider.refresh();
        }),

        vscode.commands.registerCommand('undotree.redo', () => {
            const undoTree = treeDataProvider.getUndoTreeForActiveEditor();
            if (!undoTree) return;
            undoTree.redo(0); // Assuming single child for simplicity, takes the first in history
            treeDataProvider.refresh();
        }),

        vscode.commands.registerCommand('undotree.saveAndAdvance', async () => {
            const undoTree = treeDataProvider.getUndoTreeForActiveEditor();
            if (!undoTree) return;

            await vscode.workspace.saveAll();

            const text_buff = vscode.window.activeTextEditor?.document.getText() || '';
            if (text_buff !== undoTree.getCurrentNode().state) {
                const nodeCount = undoTree.addState(text_buff);
                undoTree.redo(nodeCount - 1);
                treeDataProvider.refresh();
                const result = await parseJsUsingSWC(text_buff)
            }
        }),

        vscode.commands.registerCommand('undotree.resetTree', () => {
            const undoTree = treeDataProvider.getUndoTreeForActiveEditor();
            if (!undoTree) return;
            const newInitState = vscode.window.activeTextEditor?.document.getText() || '';
            undoTree.reset(newInitState);
            undoTree.addState(newInitState);
            treeDataProvider.refresh();
        }),

        vscode.commands.registerCommand('undotree.toggleTimecode', () => {
            const undoTree = treeDataProvider.getUndoTreeForActiveEditor();
            if (!undoTree) return;
            undoTree.toggleTimecode();
            treeDataProvider.refresh();
        }),

        vscode.commands.registerCommand('undotree.gotoState', (node) => {
            const undoTree = treeDataProvider.getUndoTreeForActiveEditor();
            if (!undoTree) return;
            undoTree.gotoNode(node);
            treeDataProvider.refresh();
        }),
        

        vscode.commands.registerCommand('undotree.refreshTree', () => {
            treeDataProvider.refresh();
        })
    );

    // Register the tree data provider
    vscode.window.registerTreeDataProvider('undoTreeView', treeDataProvider);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate,
 
};
