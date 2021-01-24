import { RunOptions, TestEngine, TestEnvironment, TestRunner } from 'axe-core';
export interface SiteResult {
    id: string;
    toolOptions: RunOptions;
    testEngine: TestEngine;
    testRunner: TestRunner;
    testEnvironment: TestEnvironment;
    timestamp: string;
    analyzedUrls: string[];
    countViolations: number;
    countPasses: number;
    countIncomplete: number;
    countInapplicable: number;
}
