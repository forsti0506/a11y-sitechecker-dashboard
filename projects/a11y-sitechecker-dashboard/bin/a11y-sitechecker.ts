#!/usr/bin/env node

import * as pkg from '../package.json';
import * as commander from 'commander';
import * as chalk from 'chalk';
import { Config } from 'a11y-sitechecker/lib/models/config';
import * as fs from 'fs';
import * as child from 'child_process';

const config: Config = { json: true, resultsPath: 'results', axeConfig: {} };

// Here we're using Commander to specify the CLI options
commander
    .version(pkg.version)
    .usage('[options] <paths>')
    .option('-j, --json', 'Output results as JSON')
    .option('--config <string>', 'Provide a config.json')
    .option(
        '-T, --threshold <number>',
        'permit this number of errors, warnings, or notices, otherwise fail with exit code 2',
        '0',
    )
    .parse(process.argv);

function setupTimeResults(): void {
    console.log(
        chalk.blue('#############################################################################################'),
    );
    console.log(chalk.blue('Updating resultsFolder with file with Current Time (later on this can be saved in a db)'));
    console.log(
        chalk.blue('#############################################################################################'),
    );
    // destination will be created or overwritten by default.
    const runResults = fs.readFileSync(config.resultsPath + '/results.json');
    const jsonRunResults = JSON.parse(runResults.toString());

    const currentDate = new Date();
    const dateToSave = String(
        currentDate.getDate().toLocaleString().padStart(2, '0') +
            '_' +
            (currentDate.getMonth() + 1).toLocaleString().padStart(2, '0') +
            '_' +
            currentDate.getFullYear() +
            '_' +
            currentDate.getHours().toLocaleString().padStart(2, '0') +
            '_' +
            currentDate.getMinutes().toLocaleString().padStart(2, '0'),
    );
    if (!fs.existsSync('src/assets/results/dashboard')) {
        fs.mkdirSync('src/assets/results/dashboard');
    }
    fs.writeFileSync('src/assets/results/dashboard/' + dateToSave + '.json', JSON.stringify(jsonRunResults, null, 4));

    let filelist = '';
    const files = fs.readdirSync('src/assets/results/dashboard/');
    files.forEach(function (file) {
        // Do whatever you want to do with the file
        if (file.includes('.json')) {
            filelist += file + ';\n';
        }
    });
    fs.writeFileSync('src/assets/results/dashboard/files.txt', filelist);
}

(async (): Promise<void> => {
    if (commander.config) {
        const configFile = JSON.parse(fs.readFileSync(commander.config).toString('utf-8'));
        if (configFile.resultsPath && typeof configFile.resultsPath === 'string') {
            config.resultsPath = configFile.resultsPath;
        }
    }

    commander.rawArgs;
    child
        .spawn(
            'a11y-sitechecker',
            commander.rawArgs.filter((el, idx) => idx > 1),
            {
                shell: true,
                stdio: 'inherit',
            },
        )
        .on('exit', (code) => {
            if (code === 0) {
                setupTimeResults();
            } else {
                console.log(chalk.red('Error happenend with errorCode: ' + code));
            }
        });
})();
