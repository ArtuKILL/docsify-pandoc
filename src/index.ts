import chalk from "chalk";

import { readFileSync, writeFileSync } from "fs";
import which from "which";
import { exec } from "child_process";
import { stderr } from "process";

interface Config {
  mustache: boolean;
  convertTo: string;
  pandocPath: string | null;
  referenceDoc: string | null;
  outputPath: string;
  outputName: string | null;
}

function merge(a: Object, b: Object) {
  return {
    ...b,
    ...a,
  }
}

const defaultConfig = {
  mustache: false,
  convertTo: 'docx',
  pandocPath: null,
  referenceDoc: null,
  outputPath: '.',
  outputName: null
}

function pandocOutput(err: any, stdout: any, stderr: any) {
  if (err) {
    console.error(chalk.red("Error: "), stderr);
    process.exit(1);
  } else {
    console.log(stdout);
  }
}


export function main(config: Object) {
  console.log(chalk.bold.cyanBright.underline("Docsify pandoc!"));
  console.log();

  const runtimeConfig = merge(config, defaultConfig) as Config;
  console.log(chalk.bold("Using config: "));
  console.table(chalk.yellow(JSON.stringify(runtimeConfig, null, 2)));


  let pandocPath: string | null = runtimeConfig.pandocPath;

  const {
    mustache,
    convertTo,
    outputPath,
    outputName,
    referenceDoc
  } = runtimeConfig;

  if (!pandocPath) {
    try {
      pandocPath = which.sync('pandoc');
    } catch {
      pandocPath = null;
    }
    console.log();
    if (pandocPath)
      console.log(chalk.green("pandoc found at: ") + pandocPath)
  }

  if (!pandocPath) {
    console.error("Cannot find pandoc, please provide the path in the config file.");
    process.exit(1);
  }


  exec(`${pandocPath} -f gfm -t ${convertTo} -o ${outputName}.docx *.md`, pandocOutput);

}







