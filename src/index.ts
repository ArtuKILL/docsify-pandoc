import chalk from "chalk";

import { readFileSync, stat } from "fs";
import which from "which";
import { exec } from "child_process";
import Mustache from "mustache";
import { ShellString } from "shelljs";

interface MustacheConfig {
  data: string | string[];
}


interface Config {
  mustache: MustacheConfig | null;
  convertTo: string;
  contents: string;
  pandocPath: string | null;
  referenceDoc: string | null;
  pdfEngine: string;
  outputFilename: string;
  outputDir: string;
  rootPath: string;
}

function merge(a: Object, b: Object) {
  return {
    ...b,
    ...a,
  }
}

const defaultConfig = {
  mustache: null,
  convertTo: 'docx',
  pandocPath: null,
  contents: '_sidebar.md',
  pdfEngine: 'pdflatex',
  referenceDoc: null,
  outputFilename: 'doc',
  outputDir: '.',
  rootPath: '.',
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
    outputFilename,
    outputDir,
    referenceDoc,
    contents,
    rootPath,
    pdfEngine,
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

  let mdFiles: (string | undefined)[] | undefined;

  try {
    const contentsStr = readFileSync(`${rootPath}/${contents}`).toString();

    mdFiles = contentsStr
      .match(/\(([a-zA-Z0-9./_]+)\)/gi)
      ?.map(item => item.match(/\(([a-zA-Z0-9./_]+)\)/)?.[1]);

  } catch {
    console.error("Error reading files, check contents path!");
    console.error(`Is ${rootPath}/${contents} the right path?`)
    process.exit(1);
  }


  if (!pandocPath) {
    console.error("Cannot find pandoc, please provide the path in the config file.");
    process.exit(1);
  }

  if (!mdFiles) {
    console.error("No files detected!");
    process.exit(1);
  }


  mdFiles = mdFiles.map(filename => filename === "/" ? `${rootPath}/README.md` : `${rootPath}/${filename}`);


  if (mustache) {

    let bigMdString: string = "";


    for (const mdFilename of mdFiles) {
      if (!mdFilename)
        continue;
      bigMdString += readFileSync(`${rootPath}/${mdFilename}`, 'utf8').toString(); +  "\n<br>\n";
    }

    const data = mustache.data;

    let views: object[] = [];

    if (data instanceof Array) {
      for (const path of data) {
        try {
          const viewFile = readFileSync(`${rootPath}/${path}`, 'utf8');
          const view = JSON.parse(viewFile);
          views.push(view);
        } catch {
          console.error("Data path provided in config not exist");
          process.exit(1);
        }
      }

    } else if (typeof data === 'string') {
      try {
        const viewFile = readFileSync(`${rootPath}/${data}`, 'utf8');
        const view = JSON.parse(viewFile);
        views.push(view);
      } catch {
        console.error("Data path provided in config not exist");
        process.exit(1);
      }
    } else {
      console.error("Unkown data provided in mustache");
      process.exit(1);
    }



    for (const view of views) {
      bigMdString = Mustache.render(bigMdString, view);
    }

    // console.log(bigMdString);

    const pipeStr: ShellString = ShellString(bigMdString);

    const command = `${pandocPath} -f gfm -t ${convertTo} ${convertTo === "pdf" ? "--pdf-engine=" + pdfEngine : ""} ${referenceDoc ? "--reference-doc=" + referenceDoc : ""} -o ${outputDir}/${outputFilename}`;

    console.log(chalk.yellow("executing: "), command);

    const status = pipeStr.exec(command);
    // console.log(thing);
    // exec(`echo ${bigMdString} | ${pandocPath} -f gfm -t ${convertTo} -o ${output}.${convertTo}`, pandocOutput);

    if (status.code) {
      console.error("Error on convertion");
      process.exit(1);
    }

    console.log(chalk.green("Convertion successful! 🎉"));
    process.exit(0);
  }

  if (!mustache) {
    const command = `${pandocPath} -f gfm -t ${convertTo} ${convertTo === "pdf" ? "--pdf-engine=" + pdfEngine : ""} -o ${outputDir}/${outputFilename} ${referenceDoc ? "--reference-doc=" + referenceDoc : ""} ${mdFiles.join(" ")}`;
    console.log(chalk.yellow("executing: "), command);
    exec(command, pandocOutput);
    console.log(chalk.green("Convertion successful! 🎉"));
  }
  process.exit(0);
}







