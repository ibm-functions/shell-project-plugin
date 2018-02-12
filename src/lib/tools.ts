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
import { join } from 'path';
import { createWriteStream, existsSync, unlinkSync } from 'fs';
import { ensureDirSync } from 'fs-extra';
import * as dbgc from 'debug';

// tslint:disable-next-line:no-var-requires
const os = require('os');

const debug = dbgc('project:tools');

declare let repl: any;

const wskdeployPlatform = {
    darwin: 'mac',
    linux: 'linux',
    win32: 'windows'
};

const wskdeployArch = {
    x64: 'amd64'
};

export function getToolsDir(ui): string {
    const rootDir = ui.userDataDir();
    return join(rootDir, 'tools');
}

export async function checkTools(block, nextBlock, { ui }): Promise<string> {
    const toolsDir = getToolsDir(ui);
    if (!existsSync(join(toolsDir, 'wskdeploy'))) {
        return new Promise<string>(resolve => {
            repl.prompt('wskdeploy', block, nextBlock, { placeholder: `wskdeploy not found. Enter 'yes' to install it` }, options => {
                if (options.field === 'yes')
                    installWskdeploy(toolsDir, block, nextBlock, { ui }).then(result => resolve(result));
                else
                    resolve("");
            });
        });
    }
    return "";
}

async function installWskdeploy(toolsDir, block, nextBlock, { ui }): Promise<string> {
    const platform = wskdeployPlatform[os.platform];
    const arch = wskdeployArch[os.arch];
    const zip = platform !== 'linux';
    const ext = zip ? 'zip' : 'tgz';
    const url = `https://github.com/apache/incubator-openwhisk-wskdeploy/releases/download/latest/wskdeploy-latest-${platform}-${arch}.${ext}`;
    debug('downloading %s', url);

    const tempFile = `${toolsDir}/tmp`;

    try {
        await download(url, toolsDir, 'tmp');

        const decompress = await import('decompress');
        if (zip) {
            await decompress(tempFile, toolsDir);
        } else {
            const decompressTar = await import('decompress-tar');

            await decompress(tempFile, toolsDir, {
                plugins: [
                    decompressTar()
                ]
            });
        }
        return "";
    } catch (e) {
        return e;
    } finally {
        try {
            await unlinkSync(tempFile);
            // tslint:disable-next-line:no-empty
        } catch (e) { }
    }
}

async function download(url, dir, filename) {
    const http = (await import('follow-redirects')).https;

    ensureDirSync(dir);
    const tempFile = `${dir}/${filename}`;
    const file = createWriteStream(tempFile);

    return new Promise((resolve, reject) => {
        const request = http.get(url, response => {
            response.pipe(file);
            response.on('end', () => {
                file.close();
                resolve();
            });
        }).on('error', err => {
            debug(err);
            reject(err);
        });
    });
}
