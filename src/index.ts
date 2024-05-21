import chalk from "chalk";
import { readFileSync, writeFileSync } from "fs";


function merge(a: Object, b: Object){
  return {
    ...b,
    ...a,
  }
}



const defaultConfig = {
  mustache: false,
  convertTo: 'docx',
  pandocPath: '/usr/bin/pandoc',
  referenceDoc: null,
  outputPath: '.',
  outputName: null
}


export function main(config: Object){  
  const runtimeConfig = merge(config, defaultConfig);
  console.log(chalk.bold("Config: "));
  console.log(chalk.bgBlue(JSON.stringify(runtimeConfig, null, 2)));
}





console.log(chalk.black.bgCyanBright("docsify pandoc!"));


