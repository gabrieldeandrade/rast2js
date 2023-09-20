import esprima from 'esprima';
import escodegen from 'escodegen';
import {readFileSync} from 'fs';
import {File} from "./src/models/File";
import {ESTreeConverter} from "./src/converters/ESTreeConverter";
import {Program} from "estree";

const startTime: Date = new Date();

const VERSION = '0.1.7'

function importTestFiles() {

}

function openFile(path: string): string {
    return readFileSync(path, 'utf-8');
}

function openRASTFile(path: string): File {
    return JSON.parse(openFile(path)) as File;
}

function init() {
    console.log('Rinha AST to Javascript transpiler backend (rast2js). Ver: ' + VERSION);
    console.log("Started: " + startTime.toISOString());

    const filepath = process.env.npm_config_file;

    if (filepath == null) {
        throw new Error("Error: Valid file path argument required. eg: npm start --file=/home/username/my_rast.json");
    }

    console.log("Opening: " + filepath);
    const fileTerm = openRASTFile(filepath);

    // console.log("Printing root file term: ");
    // console.log(fileTerm);

    console.log("Converting...");
    const converter = new ESTreeConverter(fileTerm);

    const converted: Program = converter.convert();
    console.log(JSON.stringify(converted, null, 4));

    console.log("Printing result: \n")
    console.log(escodegen.generate(converted));

    console.log("Done: " + (new Date().getTime() - startTime.getTime()) + 'ms');
}

init();

