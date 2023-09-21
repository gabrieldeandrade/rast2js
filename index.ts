import escodegen from 'escodegen';
import {readFileSync, writeFileSync} from 'fs';
import {File} from "./src/models/File";
import {ESTreeConverter} from "./src/converters/ESTreeConverter";
import {Program} from "estree";
import {spawn} from "child_process";

const startTime: Date = new Date();

const API_FILE_PATH = './src/api/api.js';
const DEFAULT_OUTPUT_PATH = './output/out.js';
const VERSION = '0.1.8'

let filepath: string | undefined;

function init() {
    console.log('Rinha AST to Javascript transpiler backend (rast2js). Ver: ' + VERSION);
    console.log("Started: " + startTime.toISOString());

    filepath = process.env.npm_config_file;

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

    const result = escodegen.generate(converted);

    console.log("Saving result: \n")
    console.log(result);
    const output = saveOutput(addApi(result));

    console.log("Generation done in: " + (new Date().getTime() - startTime.getTime()) + 'ms');

    console.log("Running: \n\n");

    eval(output);
    //runOutput();

}

function saveOutput(output: string)  {
    writeFileSync(DEFAULT_OUTPUT_PATH, output);
    return output;
}

function addApi(result: string) {
    let output = openFile(API_FILE_PATH);
    output += '// rast2js ver: ' + VERSION + ' \n'
    output += '// Input file: ' + filepath + ' \n'
    output += '// Generated at: ' + new Date().toISOString() + ' \n \n'

    return output + result;
}

function runOutput() {

    // const child = spawn('node $PWD/output/out.js');
    // child.stdout.on('data', (data) => {
    //     console.log(data.toString());
    // });
    //
    // child.stderr.on('data', (data) => {
    //     console.error(`Erro:\n${data}`);
    // });
}

function openFile(path: string): string {
    return readFileSync(path, 'utf-8');
}

function openRASTFile(path: string): File {
    return JSON.parse(openFile(path)) as File;
}

init();

