#!/usr/bin/env node

import * as pkg from '../package.json';
import * as commander from 'commander';
import * as chalk from 'chalk';
import { Config } from 'a11y-sitechecker/lib/models/config';
import * as fs from 'fs';
import * as child from 'child_process';
import { analyzeSite } from 'a11y-sitechecker';

const config: Config = { json: true, resultsPath: 'results', axeConfig: {} };

let analyzedUrl;

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
    const fileToSave = 'src/assets/results/dashboard/' + dateToSave + '.json';
    fs.writeFileSync(fileToSave, JSON.stringify(jsonRunResults, null, 4));

    fs.readFile('src/assets/results/dashboard/files.json', (err, data) => {
        let fileObject;
        if (err) {
            fileObject = [{ url: analyzedUrl, files: [fileToSave] }];
        } else {
            fileObject = JSON.parse(data.toString());
            if (fileObject.filter((f) => f.url.includes(analyzedUrl)).length > 0) {
                fileObject.filter((f) => f.url.includes(analyzedUrl))[0].files.push(fileToSave);
            } else {
                fileObject.push({ url: analyzedUrl, file: fileToSave });
            }
        }
        fs.writeFileSync('src/assets/results/dashboard/files.json', JSON.stringify(fileObject, null, 4));
    });
}

(async (): Promise<void> => {
    if (commander.config) {
        const configFile = JSON.parse(fs.readFileSync(commander.config).toString('utf-8'));
        if (configFile.resultsPath && typeof configFile.resultsPath === 'string') {
            config.resultsPath = configFile.resultsPath;
        }
    }

    analyzedUrl = commander.args[0];
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
