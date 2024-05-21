#!/usr/bin/env -S node 

import { cosmiconfigSync } from 'cosmiconfig';
import { main } from '../dist/index.js';

const explorer = cosmiconfigSync('docsify-pandoc')
const configFile = explorer.search();
main(configFile?.config);



