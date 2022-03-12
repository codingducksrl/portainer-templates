const fs = require("fs");
const path = require("path");

const DIST = "dist";
const GITHUB_REPO_URL = "https://github.com/codingducksrl/dockerimages";
const GITHUB_BRANCH = "master";

build();

function getAllApps(){

    const apps = [];

    const files = fs.readdirSync("apps", {
        withFileTypes: true
    });

    for (const file of files) {
        if(file.isDirectory()){
            const appPath = path.join("apps",file.name);
            const templatePath = path.join(appPath,"template.json");
            if(fs.existsSync(templatePath)){
                apps.push({
                    name: file.name,
                    path: appPath,
                    templare: templatePath
                })
            }
        }
    }

    return apps;
}

function parseTemplate(templatePath){
    let template = fs.readFileSync(templatePath).toString("utf-8");

    template = template.replaceAll("{{GITHUB_REPO}}",GITHUB_REPO_URL)
    template = template.replaceAll("{{GITHUB_BRANCH}}",GITHUB_BRANCH)

    let GITHUB_REPO_RAW = GITHUB_REPO_URL.replaceAll("https://github.com","https://raw.githubusercontent.com")+"/"+GITHUB_BRANCH;
    template = template.replaceAll("{{GITHUB_REPO_RAW}}",GITHUB_REPO_RAW)

    return JSON.parse(template);
}

function generateTemplateFile(){
    const apps = getAllApps();

    const final_template = {
        version: "2",
        templates: [],
    };

    for (const app of apps) {
        const template = parseTemplate(app.templare);
        final_template.templates.push(template);
    }

    return JSON.stringify(final_template);
}

function build(){
    if(fs.existsSync(DIST)){
        fs.rmSync(DIST,{recursive: true, force: true});
    }
    fs.mkdirSync(DIST);

    const templateFilePath = path.join(DIST,"template.json");
    const template = generateTemplateFile();

    fs.writeFileSync(templateFilePath,template)
}
