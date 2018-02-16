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
import * as fs from 'fs-extra';
import * as path from 'path';
import { exec } from 'child-process-promise';
import * as parser from 'properties-parser';
import * as jwtDecode from 'jwt-decode';

import * as dbgc from 'debug';
const debug = dbgc('project:bluemix');

// @return true if Bluemix with wsk plugin is available on this system, false otherwise
export async function isBluemixCapable() {
    if (process.env.BLUEMIX_API_KEY) {
        try {
            await exec('bx wsk help');
            return true;
        } catch (e) {
            return false;
        }
    }
    return false;
}

export interface ICredential {
    /* IBM Cloud Platform API key */
    apikey?: string;

    /* IBM Cloud endpoint */
    endpoint?: string;

    /* IBM Cloud organization. Optional */
    org?: string;

    /* IBM Cloud space. Optional */
    space?: string;

    /* Local cache (filesystem) */
    home?: string;
}

export interface IWskProps {
    APIHOST?: string;
    AUTH?: string;
    IGNORE_CERTS?: boolean;
    APIGW_ACCESS_TOKEN?: string;
    [key: string]: any;
}

interface IJWTToken {
    name: string;
    iat: number; // Issued At
    exp: number; // Experiration time in second
}

// Decoded IAM tokens
const iamTokens: { [key: string]: IJWTToken } = {};

export const wskProps = (cred: ICredential) => `${cred.home}/.wskprops`;

// Run bluemix command. Refresh token if needed.
export async function run(cred: ICredential, cmd: string) {
    if (await login(cred)) {
        return doRun(cred, cmd);
    }
    return null;
}

// Same as run without login
async function doRun(cred: ICredential, cmd: string) {
    const bx = `WSK_CONFIG_FILE="${wskProps(cred)}" BLUEMIX_HOME="${cred.home}" bx ${cmd}`;
    debug(`exec ${bx}`);
    const result = await exec(bx);
    debug(`result: ${result}`);
    return result;
}

// Login to Bluemix. Only do it if token has expired.
async function login(cred: ICredential) {
    let dologin = true;
    const key = getIAMTokenKey(cred);
    let token = iamTokens[key];
    if (token) {
        // Check expiration
        const now = Date.now() / 1000;
        dologin = (token.exp + 300) > now; // Give 5mn for the command to run.
    }

    if (dologin) {
        debug('Refreshing IBM cloud IAM token');
        const space = cred.space ? `-s ${cred.space}` : '';
        const bx = `login -a ${cred.endpoint} --apikey ${cred.apikey} -o ${cred.org} ${space}`;
        try {
            await doRun(cred, bx);
            cacheIAMToken(cred);
        } catch (e) {
            debug(e);
            return false;
        }
    }
    return true;
}

function cacheIAMToken(cred: ICredential): IJWTToken {
    const cfgFilename = path.join(cred.home, '.bluemix', 'config.json');
    const config = fs.readJSONSync(cfgFilename, { throws: false });
    if (!config) {
        debug(`${cfgFilename} could not be read`);
        return null;
    }

    if (!config.IAMToken || config.IAMToken.length < 7) {
        debug(`no IAM token in ${cfgFilename}`);
        return null;
    }

    const rawToken = config.IAMToken.substr(7);
    try {
        const token = jwtDecode(rawToken);

        const key = getIAMTokenKey(cred);
        iamTokens[key] = token;
        debug(`token ${key} cached`);
        return token;
    } catch (e) {
        debug(e); // Invalid token?
        return null;
    }
}

// ICInvalidateIamToken invalidate token. Will be refreshed when login is called
function ICInvalidateIamToken(cred: ICredential) {
    const key = getIAMTokenKey(cred);
    delete iamTokens[key];
}

function getIAMTokenKey(cred: ICredential): string {
    return `${cred.endpoint}${cred.org}${cred.space ? cred.space : ''}`;
}

// Install Cloud function plugin
export async function installWskPlugin(cred: ICredential) {
    const cfpath = path.join(cred.home, '.bluemix', 'plugins', 'cloud-functions');
    if (!fs.pathExistsSync(cfpath)) {
        debug('installing IBM cloud function plugin');
        // TODO: should use local copy.
        await run(cred, 'plugin install Cloud-Functions -r Bluemix -f');
    }
}

export function fixupCredentials(cred: ICredential, userDataDir: string) {
    cred.home = path.join(userDataDir, 'bx', cred.endpoint, cred.org, cred.space ? cred.space : '');
}

export async function ensureSpaceExists(cred: ICredential) {
    debug(`checking ${cred.space} space exists`);

    const subcred = {...cred};
    delete subcred.space;
    await run(subcred, `account space-create ${cred.space}`); // fast when already exists

    await installWskPlugin(cred);
    await refreshWskProps(cred, 30); // refresh .wskprops
}

async function refreshWskProps(cred: ICredential, retries: number) {
    if (retries <= 0)
        throw new Error('unable to obtain wsk authentication key. try again later.');

    const io = await doRun(cred, 'wsk property get');
    if (io.stderr) {
        await delay(500);
        debug(`could not get wsk AUTH key. Retrying (${retries}) (${io.stderr})`);
        await refreshWskProps(cred, retries - 1);
    }
}

// Get Wsk AUTH and APIGW_ACCESS_TOKEN for given credential. If cred space does not exist, create it.
export async function getWskPropsForSpace(cred: ICredential) {
    debug('retrieving wsk authentication');
    await ensureSpaceExists(cred);
    return parser.read(wskProps(cred));
}

// Convert env name to valid namespace
export function escapeNamespace(str: string) {
    // The first character must be an alphanumeric character, or an underscore.
    // The subsequent characters can be alphanumeric, spaces, or any of the following: _, @, ., -
    return str.replace(/[+]/g, '-');
}

export async function delay(ms) {
    return new Promise(resolve => {
        setTimeout(() => resolve(), ms);
    });
}
