/*
 * Copyright 2018 IBM Corporation
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
import { checkTools, getToolsDir } from './tools';
import { join } from 'path';
import { execSync, ExecSyncOptions } from 'child_process';
import * as dbgc from 'debug';
import { gitClone } from './git';
const debug = dbgc('project:deploy');

export async function deploy(prequire, ui, location: string, managed: boolean, inputs: { [key: string]: string } = {}) {
    if (location.startsWith('http')) {
        location = await gitClone(location);
    }

    const env = getEnvPlugin(prequire);
    const current = env ? env.current() : null;
    const userData = ui.userDataDir();

    let sysenv = prepareEnvVars(current);
    const wskdeploy = join(getToolsDir(ui), 'wskdeploy').replace(/[ ]/g, '\\ ');

    sysenv = {...sysenv, ...inputs };
    debug(sysenv);

    return execSync(`${wskdeploy} ${managed ? '--managed' : ''} -m "${location}"`, { env: sysenv }).toString();
}

function getEnvPlugin(prequire) {
    try {
        return prequire('shell-environment-plugin');
    } catch (e) {
        // no environment, fine
        return null;
    }
}

// Extends system environment variables
function prepareEnvVars(env): { [key: string]: string } {
    if (env) {
        const vars = { ...env.variables };
        Object.keys(vars).forEach(key => {
            vars[key] = vars[key].value;
        });
        // TODO: consider not inheriting process env
        return { ...process.env, ...vars };
    }
    // TODO: consider not inheriting process env
    return { ...process.env };
}
