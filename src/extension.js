
const vscode = require('vscode');
const UndoTreeProvider = require('./tree/undotreeprovider.js');
const UndoTree = require('./tree/undotree.js');
const { trackEditorChanges } = require("./config/configManager.js")
// const {parseJsUsingSWC} = require("./javascript/parserJs.js")
const { parseCode } = require("./parse.js")
// import { parseJsUsingSWC } from './javascript/parser.js';
const { getConfig, getFramework, getFuncRecommendations, getLanguage } = require("./config/configStore.js");
const { recommendation } = require('./recommendationSystem/recommendation.js');
const { createWebview } = require('./recommendationSystem/view.js');

function activate(context) {


    const treeDataProvider = new UndoTreeProvider();




    vscode.window.onDidChangeActiveTextEditor(async (editor) => {
        if (editor) {
            const result = await trackEditorChanges(editor);

            if (result === 1) {
                const { config, language, framework, funcRecommendation } = getConfig();
                console.log("Using latest config:", config);
                console.log("Language settings:", language);
                console.log("Framework settings:", framework);
                console.log("Function recommendation settings:", funcRecommendation);
            } else {
                console.log("There was an error while getting the config");
            }

            treeDataProvider.getUndoTreeForActiveEditor();
            treeDataProvider.refresh();
        }
    });

    if (vscode.window.activeTextEditor) {
        trackEditorChanges(vscode.window.activeTextEditor);
    }



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

                let parsedData = null;
                const config = getConfig()
                console.log("this is config : ", config, config?.["func-recommendation"], config?.["func-recommendation"]?.active)
                if (config?.["func-recommendation"]?.active == true) {

                    parsedData = await parseCode(config?.["language"], config?.["framework"], text_buff)
                    const nodeCount = undoTree.addState(text_buff, parsedData);
                    undoTree.redo(nodeCount - 1);
                    treeDataProvider.refresh();
                } else {
                    const nodeCount = undoTree.addState(text_buff, parsedData);
                    undoTree.redo(nodeCount - 1);
                    treeDataProvider.refresh();
                }
                // const parsedData = await parseCode(language, framework, text_buff)
            }
        }),
        vscode.commands.registerCommand('undotree.recommendations', async (node) => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showInformationMessage("No active editor!");
                return;
            }
            const file_buff = vscode.window.activeTextEditor?.document.getText() || '';

            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);

            const undoTree = treeDataProvider.getUndoTreeForActiveEditor();
            if (!undoTree) return;

            const root = undoTree.getRoot();
            let parsedData = null;
            const config = getConfig()
            // console.log("this is config : ", config, config?.["func-recommendation"], config?.["func-recommendation"]?.active)
            if (config?.["func-recommendation"]?.active == true) {

                parsedData = await parseCode(config?.["language"], config?.["framework"], selectedText)

            }

            console.log("Node Type:", typeof node, "\t", node);
            console.log("Selected Text:", selectedText);
            console.log("ast produced : ", parsedData)
            let suggestions = recommendation(root, parsedData)
            // if (suggestions !== null) {

            createWebview(suggestions, context)
            console.log("suggestions given : ", suggestions)
            treeDataProvider.refresh();
            // }
            // Process selection with your logic
            // selective(node, root, selectedText);
            // Refresh tree if necessary
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
function deactivate() { }

module.exports = {
    activate,
    deactivate,

};
