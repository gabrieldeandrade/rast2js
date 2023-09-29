import escodegen from 'escodegen';
import {readFileSync, writeFileSync} from 'fs';
import {File} from "./src/models/File";
import {ESTreeConverter} from "./src/converters/ESTreeConverter";
import {Program} from "estree";
import {spawn} from "child_process";

const startTime: Date = new Date();

const API_FILE_PATH = './src/api/api.js';
const DEFAULT_OUTPUT_PATH = 'out.js';
const VERSION = process.env.npm_package_version;

let filepath: string | undefined;
let silent: boolean = true;

function init() {
    silent = process.env.npm_config_mute === 'true';
    filepath = process.env.npm_config_file;

    log('Rinha AST to Javascript (rast2js). Ver: ' + VERSION);

    if (filepath == null) {
        throw new Error("Error: Valid file path argument required. eg: npm start --file=/home/username/my_rast.json");
    }

    log("Started: " + startTime.toISOString());

    log("Opening: " + filepath);
    const fileTerm = openRASTFile(filepath);

    // log("Printing root file term: ");
    // log(fileTerm);

    log("Converting...");
    const converter = new ESTreeConverter(fileTerm);

    const converted: Program = converter.convert();
    // log(JSON.stringify(converted, null, 4));
    // console.log(JSON.stringify(converted, null, 4));

    const result = escodegen.generate(converted);

    log("Saving result: \n")
    log(result);
    const output = saveOutput(addApi(result));

    log("\nGeneration done in: " + (new Date().getTime() - startTime.getTime()) + 'ms');

    log("Running: \n");

    if (!silent) {
        eval(output);
        //runOutput();
    }

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
    // TODO fix
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

function log(text: string) {
    if (!silent) {
        console.log(text);
    }
}

init();

