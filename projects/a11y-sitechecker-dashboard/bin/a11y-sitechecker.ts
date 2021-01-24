#!/usr/bin/env node

import * as pkg from '../package.json';
import * as commander from 'commander';
import * as chalk from 'chalk';
import * as fs from 'fs';
import { MongoClient } from 'mongodb';
import { DashboardConfig } from './dashboard-config';
import { A11ySitecheckerResult } from 'a11y-sitechecker/lib/models/a11y-sitechecker-result';
import { entry } from 'a11y-sitechecker';
import { setupAxeConfig, setupConfig } from 'a11y-sitechecker/lib/utils/setup-config';
import { v4 as uuidv4 } from 'uuid';
import { SiteResult } from '../src/lib/models/site-result';
import { AnalyzedSite } from '../src/lib/a11y-sitechecker-dashboard.service';

const config: DashboardConfig = { json: true, resultsPath: 'results', axeConfig: {}, threshold: 0 };

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

async function setupTimeResults(): Promise<void> {
    if (config.db && config.db.type === 'mongodb') {
        console.log(
            chalk.blue('#############################################################################################'),
        );
        console.log(chalk.blue('Updating database with the current results)'));
        console.log(
            chalk.blue('#############################################################################################'),
        );
        const sitecheckerResult: A11ySitecheckerResult = await entry(
            setupConfig(commander),
            setupAxeConfig(config),
            commander.args[0],
            true,
        );
        const client = new MongoClient('mongodb+srv://' + config.db.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            auth: { user: config.db.user, password: config.db.password },
        });
        await client.connect();

        try {
            const db = client.db('a11y-sitechecker-dashboard');
            const dbSiteResult: AnalyzedSite[] = await db
                .collection('sites')
                .find<AnalyzedSite>({ url: sitecheckerResult.url })
                .toArray();
            let id;
            if (dbSiteResult.length > 0) {
                id = dbSiteResult[0]._id;
            } else {
                id = uuidv4();
                await db.collection('sites').insertOne({ _id: id, url: sitecheckerResult.url });
            }
            const siteResult: SiteResult = {
                id: id,
                toolOptions: sitecheckerResult.toolOptions,
                testEngine: sitecheckerResult.testEngine,
                testRunner: sitecheckerResult.testRunner,
                testEnvironment: sitecheckerResult.testEnvironment,
                timestamp: sitecheckerResult.timestamp,
                analyzedUrls: sitecheckerResult.analyzedUrls,
                countViolations: sitecheckerResult.violations
                    .map((v) => v.nodes.length)
                    .reduce((count, value) => count + value, 0),
                countPasses: sitecheckerResult.passes
                    .map((v) => v.nodes.length)
                    .reduce((count, value) => count + value, 0),
                countIncomplete: sitecheckerResult.incomplete
                    .map((v) => v.nodes.length)
                    .reduce((count, value) => count + value, 0),
                countInapplicable: sitecheckerResult.inapplicable.length,
            };

            await db.collection('siteResults').insertOne({ siteResult });
            await db.collection('violations').insertOne({
                id: id,
                timestamp: sitecheckerResult.timestamp,
                violations: sitecheckerResult.violations,
            });
            await db
                .collection('passes')
                .insertOne({ id: id, timestamp: sitecheckerResult.timestamp, violations: sitecheckerResult.passes });
            await db.collection('incompletes').insertOne({
                id: id,
                timestamp: sitecheckerResult.timestamp,
                violations: sitecheckerResult.incomplete,
            });
            await db.collection('inapplicables').insertOne({
                id: id,
                timestamp: sitecheckerResult.timestamp,
                violations: sitecheckerResult.inapplicable,
            });
            await client.close();
        } catch (e) {
            console.log(e);
        }
    } else {
        console.log(
            chalk.blue('#############################################################################################'),
        );
        console.log(chalk.blue('Updating resultsFolder with file with Current Time'));
        console.log(
            chalk.blue('#############################################################################################'),
        );
        const runResults = fs.readFileSync(config.resultsPath + '/results.json');
        const jsonRunResults: A11ySitecheckerResult = JSON.parse(runResults.toString());
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
}

(async (): Promise<void> => {
    if (commander.config) {
        const configFile = JSON.parse(fs.readFileSync(commander.config).toString('utf-8'));
        if (configFile.resultsPath && typeof configFile.resultsPath === 'string') {
            config.resultsPath = configFile.resultsPath;
        }
        if (configFile.db) {
            config.db = configFile.db;
        }
    }

    analyzedUrl = commander.args[0];
    await setupTimeResults();
})();
