#!/usr/bin/env node

import * as pkg from '../package.json';
import * as commander from 'commander';
import * as chalk from 'chalk';
import * as fs from 'fs';
import { MongoClient } from 'mongodb';
import { DashboardConfig } from './dashboard-config';
import { A11ySitecheckerResult, FullCheckerSingleResult } from 'a11y-sitechecker/lib/models/a11y-sitechecker-result';
import { entry } from 'a11y-sitechecker';
import { setupAxeConfig, setupConfig } from 'a11y-sitechecker/lib/utils/setup-config';
import { v4 as uuidv4 } from 'uuid';
import { SiteResult } from '../src/lib/models/site-result';
import { AnalyzedSite } from '../src/lib/services/a11y-sitechecker-dashboard.service';
import { getEscaped } from 'a11y-sitechecker/lib/utils/helper-functions';
import { Config } from 'a11y-sitechecker/lib/models/config';

interface FileObject {
    id: string;
    url: string;
    files: [string];
}

const config: DashboardConfig = { json: true, resultsPath: 'results', axeConfig: {}, threshold: 0, timeout: 15000 };

let analyzedUrl: string;

// Here we're using Commander to specify the CLI options
commander
    .version(pkg.version)
    .usage('[options] <paths>')
    .option('--config <string>', 'Provide a config.json')
    .option(
        '--threshold <number>',
        'permit this number of errors, warnings, or notices, otherwise fail with exit code 2',
        '0',
    )
    .parse(process.argv);

function setupSiteresult(id: string, sitecheckerResult: A11ySitecheckerResult): SiteResult {
    return {
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
        countPasses: sitecheckerResult.passes.map((v) => v.nodes.length).reduce((count, value) => count + value, 0),
        countIncomplete: sitecheckerResult.incomplete
            .map((v) => v.nodes.length)
            .reduce((count, value) => count + value, 0),
        countInapplicable: sitecheckerResult.inapplicable.length,
        tabableImages: sitecheckerResult.tabableImages,
    };
}

function defineExtraTags(sitecheckerResult: A11ySitecheckerResult): void {
    if (config.idTags) {
        const idTags = config.idTags;
        sitecheckerResult.violations.forEach((v) => {
            if (idTags[v.id]) {
                if (v.customTags) {
                    v.customTags.push(...idTags[v.id]);
                } else {
                    v.customTags = idTags[v.id];
                }
            }
        });
        sitecheckerResult.inapplicable.forEach((v) => {
            if (idTags[v.id]) {
                if (v.customTags) {
                    v.customTags.push(...idTags[v.id]);
                } else {
                    v.customTags = idTags[v.id];
                }
            }
        });
        sitecheckerResult.incomplete.forEach((v) => {
            if (idTags[v.id]) {
                if (v.customTags) {
                    v.customTags.push(...idTags[v.id]);
                } else {
                    v.customTags = idTags[v.id];
                }
            }
        });
        sitecheckerResult.passes.forEach((v) => {
            if (idTags[v.id]) {
                if (v.customTags) {
                    v.customTags.push(...idTags[v.id]);
                } else {
                    v.customTags = idTags[v.id];
                }
            }
        });
    }
}

async function setupTimeResults(): Promise<void> {
    const a11ySitecheckerConfig: Config = setupConfig(commander.opts());
    const axeConfig = setupAxeConfig(a11ySitecheckerConfig);
    const sitecheckerResult: A11ySitecheckerResult = await entry(
        a11ySitecheckerConfig,
        axeConfig,
        commander.args[0],
        true,
    );

    if (config.db && config.db.type === 'mongodb') {
        console.log(
            chalk.blue('#############################################################################################'),
        );
        console.log(chalk.blue('Updating database with the current results)'));
        console.log(
            chalk.blue('#############################################################################################'),
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
                .find<AnalyzedSite>({ url: sitecheckerResult.url }, {})
                .toArray();
            let id: string;
            if (dbSiteResult.length > 0) {
                id = dbSiteResult[0]._id;
            } else {
                id = uuidv4();
                await db.collection('sites').insertOne({ _id: id, url: sitecheckerResult.url });
            }
            const siteResult = setupSiteresult(id, sitecheckerResult);

            await db.collection('siteResults').insertOne({ siteResult });
            defineExtraTags(sitecheckerResult);
            await db.collection('violations').insertOne({
                id: id,
                timestamp: sitecheckerResult.timestamp,
                violations: sitecheckerResult.violations,
            });
            await db.collection('passes').insertOne({
                id: id,
                timestamp: sitecheckerResult.timestamp,
                violations: sitecheckerResult.passes,
            });
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

        fs.readFile('src/assets/results/dashboard/files.json', async (err, data) => {
            let fileObject: FileObject[];
            let id: string;
            if (err) {
                id = uuidv4();
                fileObject = [{ id: id, url: analyzedUrl, files: [fileToSave] }];
            } else {
                fileObject = JSON.parse(data.toString());
                if (fileObject.filter((f) => f.url.includes(analyzedUrl)).length > 0) {
                    id = fileObject.filter((f) => f.url.includes(analyzedUrl))[0].id;
                    fileObject.filter((f) => f.url.includes(analyzedUrl))[0].files.push(fileToSave);
                } else {
                    id = uuidv4();
                    fileObject.push({ id: id, url: analyzedUrl, files: [fileToSave] });
                }
            }
            const siteResult = setupSiteresult(id, sitecheckerResult);
            defineExtraTags(sitecheckerResult);
            fs.writeFileSync(fileToSave, JSON.stringify(siteResult, null, 4));
            fs.writeFileSync('src/assets/results/dashboard/files.json', JSON.stringify(fileObject, null, 4));

            const violationsPath =
                'src/assets/results/dashboard/' + getEscaped(id + sitecheckerResult.timestamp) + '_violations.json';
            await fs.promises.writeFile(violationsPath, JSON.stringify(sitecheckerResult.violations, null, 4));

            const incompletesPath =
                'src/assets/results/dashboard/' + getEscaped(id + sitecheckerResult.timestamp) + '_incompletes.json';
            await fs.promises.writeFile(incompletesPath, JSON.stringify(sitecheckerResult.incomplete, null, 4));

            const passesPath =
                'src/assets/results/dashboard/' + getEscaped(id + sitecheckerResult.timestamp) + '_passes.json';
            await fs.promises.writeFile(passesPath, JSON.stringify(sitecheckerResult.passes, null, 4));

            const inapplicablesPath =
                'src/assets/results/dashboard/' + getEscaped(id + sitecheckerResult.timestamp) + '_inapplicables.json';
            await fs.promises.writeFile(inapplicablesPath, JSON.stringify(sitecheckerResult.inapplicable, null, 4));

            if (true) {
                const filesJson = JSON.parse(fs.readFileSync('src/assets/results/dashboard/files.json').toString());
                const relatedFiles = filesJson.filter((f) => f.id === id)[0].files;
                if (relatedFiles.length > 1) {
                    let i = 0;
                    for (const file of relatedFiles) {
                        if (i < relatedFiles.length - 1) {
                            const resultFile: SiteResult = JSON.parse(fs.readFileSync(file).toString());
                            await getCountings(id, resultFile.timestamp, '_violations.json');
                            await getCountings(id, resultFile.timestamp, '_passes.json');
                            await getCountings(id, resultFile.timestamp, '_incompletes.json');
                            await getCountings(id, resultFile.timestamp, '_inapplicables.json');
                        }
                        i++;
                    }
                }
            }
        });
    }
}

async function getCountings(id: string, timestamp: string, fileEnding: string): Promise<void> {
    const violationsResultFile: FullCheckerSingleResult[] | Map<string, number> = JSON.parse(
        fs.readFileSync('src/assets/results/dashboard/' + getEscaped(id + timestamp) + fileEnding).toString(),
    );
    const violationCountingsByUrl: Map<string, number> = new Map<string, number>();
    if ((violationsResultFile as FullCheckerSingleResult[])[0]?.id !== undefined) {
        for (const fullCheckerSingleResult of violationsResultFile) {
            (fullCheckerSingleResult as FullCheckerSingleResult).nodes.forEach((node) =>
                node.targetResult.urls.forEach((u) => {
                    const elment = violationCountingsByUrl.get(u);
                    if (elment) {
                        violationCountingsByUrl.set(u, elment + 1);
                    } else {
                        violationCountingsByUrl.set(u, 1);
                    }
                }),
            );
        }
        const jsonmap: { [key: string]: number } = {};
        violationCountingsByUrl.forEach((value, key) => {
            jsonmap[key] = value;
        });
        await fs.promises.writeFile(
            'src/assets/results/dashboard/' + getEscaped(id + timestamp) + fileEnding,
            JSON.stringify(jsonmap, null, 4),
        );
    } else {
        return;
    }
}

(async (): Promise<void> => {
    const startTime = Date.now();
    const options = commander.opts();
    if (options.config) {
        const configFile = JSON.parse(fs.readFileSync(options.config).toString('utf-8'));
        if (configFile.resultsPath && typeof configFile.resultsPath === 'string') {
            config.resultsPath = configFile.resultsPath;
        }
        if (configFile.db) {
            config.db = configFile.db;
        }
        if (configFile.idTags) {
            config.idTags = configFile.idTags;
        }
    }

    analyzedUrl = commander.args[0];
    await setupTimeResults();
    console.log(chalk.green('Time needed for analysis (in s):' + (Date.now() - startTime) / 1000));
})();
