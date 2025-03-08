let config = {};
let language = null;
let framework = null;
let funcRecommendation = null;

function setConfig(newConfig) {
    config = newConfig;
    language = newConfig?.language || null;
    framework = newConfig?.framework || null;
    funcRecommendation = newConfig?.["func-recommendation"] || null;

    console.log("Config updated:", config);
    console.log("Language settings:", language);
    console.log("Framework settings:", framework);
    console.log("Function recommendation settings:", funcRecommendation);
}

function getConfig() {
    return config;
}
function getFuncRecommendations() {
    return funcRecommendation;
}
function getLanguage() {
    return language;
}
function getFramework() {
    return framework;
}
module.exports = { setConfig, getConfig, getLanguage, getFramework, getFuncRecommendations };
