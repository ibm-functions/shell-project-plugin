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
import { existsSync } from 'fs';
import { sliceCmd, error, checkExtraneous, checkExtraneousFlags } from './cli';
import { checkTools, getToolsDir } from './tools';
import { join } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';
import { ICredential, escapeNamespace, fixupCredentials, ensureSpaceExists, wskProps } from './bluemix';
import { getCurrentProject } from './storage';
import * as dbgc from 'debug';
const debug = dbgc('project:deploy');

const usage = `Deploy project.

\tdeploy [<manifest.yml>]

Required parameters:
\t<manifest.yml>       the project configuration file (default manifest.yml)`;

const doDeploy = env => async (block, nextBlock, _3, { ui, errors }, _4, _5, _6, argv) => {
    if (argv.help) {
        throw new errors.usage(usage);
    }
    const err = await checkTools(block, nextBlock, { ui });
    if (err !== "")
        return error({ errors }, err);

    sliceCmd(argv, 'deploy');
    const file = argv._.shift() || 'manifest.yml';

    checkExtraneous({ errors }, argv);

    if (!existsSync(file))
        return error({ errors }, `${file} does not exists`);

    checkExtraneousFlags({ errors }, argv);

    const current = env.current();
    const userData = ui.userDataDir();
    const wskCfg = (current) ? await prepareBackend(errors, userData, current) : join(homedir(), '.wskprops');
    if (! existsSync(wskCfg))
        return error({ errors }, `missing ${wskCfg}`);

    const sysenv = prepareEnvVars(wskCfg, current);
    const wskdeploy = join(getToolsDir(ui), 'wskdeploy').replace(/[ ]/g, '\\ ');

    return execSync(`${wskdeploy} --managed`, { env: sysenv }).toString();
};

// Make sure backend is ready for deployment. Return the location of .wskprops to be used by wskdeploy
async function prepareBackend(errors, userDataDir: string, env): Promise<string> {
    const vars = env.variables || {};
    // Check for mandatory env vars
    const apikey = vars.BLUEMIX_API_KEY;
    if (!apikey)
        throw new errors.usage(errorMissingVar('BLUEMIX_API_KEY'));

    const endpoint = vars.BLUEMIX_ENDPOINT;
    if (!endpoint)
        throw new errors.usage(errorMissingVar('BLUEMIX_ENDPOINT'));

    const org = vars.BLUEMIX_ORG;
    if (!org)
        throw new errors.usage(errorMissingVar('BLUEMIX_ORG'));

    // When deployment is once-only
    // if (env.readonly)
    const space = resolveSpace(env, null);

    // Support only IBM cloud for the moment.
    const cred: ICredential = { apikey, endpoint, org, space };
    fixupCredentials(cred, userDataDir);

    await ensureSpaceExists(cred);
    return wskProps(cred);
}

// Extends system environment variables
function prepareEnvVars(wskCfg: string, env): { [key: string]: string } {
    // TODO: env vars in env
    // TODO: consider not inheriting process env
    return { ...process.env, WSK_CONFIG_FILE: wskCfg };
}

function resolveSpace(env, version): string {
    const projectname = getCurrentProject();
    const name = env.name;

    let bxspace = (version) ? `${projectname}-${name}@${version}` : `${projectname}-${name}`;
    bxspace = escapeNamespace(bxspace);
    debug(`targeting ${bxspace} space`);
    return bxspace;
}

function errorMissingVar(name: string) {
    const div = document.createElement('div');
    div.innerHTML = `<span>missing ${name} in the list of environment variables. Please use <span class='clickable' onclick='repl.partial("env var set ${name} <variable_value&gt;")'>env var set ${name} &lt;variable_value&gt;</span> to set it</span>`;
    return div;
}

module.exports = (commandTree, prequire) => {
    let env;
    try {
        env = prequire('shell-environment-plugin');
    } catch (e) {
        // no environment, fine
    }
    commandTree.listen('/project/deploy', doDeploy(env), { docs: 'Deploy project' });
};
