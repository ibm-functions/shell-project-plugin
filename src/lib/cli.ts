/*
 * Copyright 2017 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export function error(modules, msg: string, usage = '') {
    throw new modules.errors.usage(`${msg}${usage ? '\n\n' : ''}${usage}`);
}

export function consume(argv, options: string[]) {
    return options.reduce((value, option) => {
        const v = argv[option];
        delete argv[option];
        return value || v;
    }, undefined);
}

export function checkExtraneous(modules, argv) {
    if (argv._.length !== 0)
        throw new modules.errors.usage(`Extraneous argument(s): ${argv._.join(', ')}`);
}

export function checkExtraneousFlags(modules, argv) {
    delete argv._;
    if (Object.keys(argv).length !== 0)
        throw new modules.errors.usage(`Extraneous flags(s): ${Object.keys(argv).join(', ')}`);
}

export function helpCommand(command: string, flags?: string[]) {
    console.log('Usage:');
    console.log(`  ${command}`);
    console.log('');

    if (flags) {
        console.log('Flags:');
        console.log(flags.join('\n  '));
    }
    return 'usage';
}

export function getLoggerLevel(argv) {
    const verbose = consume(argv, ['v', 'verbose']);
    const debug = consume(argv, ['d', 'debug']);
    if (debug)
        return 'debug';
    if (verbose)
        return 'info';
    return 'off';
}

export function getGlobalFlags(argv) {
    return {
        apihost: consume(argv, ['apihost']),
        apiversion: consume(argv, ['apiversion']),
        auth: consume(argv, ['u', 'auth']),
        cert: consume(argv, ['cert']),
        insecure: consume(argv, ['i', 'insecure']),
        key: consume(argv, ['key']),
        env: consume(argv, ['e', 'env'])
    };
}

export function sliceCmd(argv, cmd) {
    argv._ = argv._.slice(argv._.indexOf(cmd) + 1);
}

export async function delay(ms) {
    return new Promise(resolve => {
        setTimeout(() => resolve(), ms);
    });
}

export let globalFlagsUsage = `\t-v|--verbose   info level output
\t-d|--debug     debug level output`;
