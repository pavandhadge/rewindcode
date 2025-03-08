const Parser = require("tree-sitter");
const SQLLang = require("tree-sitter-sql");

// Function to parse SQL queries and extract relevant constructs
async function parseSqlUsingTreeSitter(sqlQuery) {
    console.log("Parsing SQL query...");

    try {
        const parser = new Parser();
        parser.setLanguage(SQLLang);

        const tree = parser.parse(sqlQuery);
        console.log("AST produced:", tree.rootNode.toString());

        if (tree) {
            let extracted = {
                SelectStatement: [],
                InsertStatement: [],
                UpdateStatement: [],
                DeleteStatement: [],
                CreateTableStatement: [],
                AlterTableStatement: [],
                DropTableStatement: [],
                WhereClause: [],
                JoinClause: [],
                GroupByClause: [],
                OrderByClause: [],
            };

            extractAST(tree.rootNode, sqlQuery, extracted);
            console.log("Extracted SQL Constructs:", extracted);

            return { ast: tree, extracted };
        }
    } catch (e) {
        console.log("Error while parsing SQL query:", e);
        return null;
    }
}

// Function to extract the correct SQL snippet
const extractCode = (node, sqlQuery) => {
    try {
        if (!node || !node.startPosition || !node.endPosition) return "";

        const start = node.startIndex;
        const end = node.endIndex;

        if (start < 0 || end > sqlQuery.length) {
            console.error(`Invalid span: start=${start}, end=${end}, SQL query length=${sqlQuery.length}`);
            return "";
        }

        return sqlQuery.slice(start, end);
    } catch (error) {
        console.log(`Error extracting code for ${node.type}:`, error);
        return "";
    }
};

// Function to traverse AST and extract relevant SQL constructs
function extractAST(node, sqlQuery, extracted) {
    if (!node) return;

    if (node.type in extracted) {
        const entry = {
            code: extractCode(node, sqlQuery),
            ast: node,
        };

        if (node.type === "SelectStatement") {
            entry.columns = extractCode(node.childForFieldName("columns"), sqlQuery);
        }
        if (node.type === "InsertStatement") {
            entry.table = extractCode(node.childForFieldName("table"), sqlQuery);
        }
        if (node.type === "UpdateStatement") {
            entry.table = extractCode(node.childForFieldName("table"), sqlQuery);
        }
        if (node.type === "DeleteStatement") {
            entry.table = extractCode(node.childForFieldName("table"), sqlQuery);
        }
        if (node.type === "CreateTableStatement") {
            entry.table = extractCode(node.childForFieldName("name"), sqlQuery);
        }
        if (node.type === "WhereClause") {
            entry.condition = extractCode(node.childForFieldName("condition"), sqlQuery);
        }
        if (node.type === "JoinClause") {
            entry.tables = extractCode(node, sqlQuery);
        }
        if (node.type === "GroupByClause") {
            entry.columns = extractCode(node, sqlQuery);
        }
        if (node.type === "OrderByClause") {
            entry.columns = extractCode(node, sqlQuery);
        }

        extracted[node.type].push(entry);
    }

    for (let i = 0; i < node.childCount; i++) {
        extractAST(node.child(i), sqlQuery, extracted);
    }
}

module.exports = { parseSqlUsingTreeSitter };
