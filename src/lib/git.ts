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
import * as simpleGit from 'simple-git/promise';
import { join } from 'path';
import { parse } from 'url';
import { pathExists, ensureDir } from 'fs-extra';

import * as dbgc from 'debug';
const debug = dbgc('project:git');

declare const ui;

// --- Git

// Clone or update git repository into local cache. Also checkout a tag/revision/branch
// Support repo subdirectory specified after repo.git/[subdir][#<tag/revision/branch>]
export async function gitClone(location: string) {
    const userData = ui.userDataDir();

    const gitIdx = location.indexOf('.git');
    if (gitIdx === -1)
        throw new Error(`Malformed git repository ${location} (missing .git)`);

    let localDir;
    let repo = location.substring(0, gitIdx + 4);
    if (repo.startsWith('ssh://')) {
        repo = repo.substr(6);
        // must be of the form git@<hostname>:<user>/<repository>.git

        const matched = repo.match(/^git@([^:]+):([^\/]+)\/(.+)\.git$/);
        if (!matched)
            throw new Error(`Malformed git repository ${repo}`);
        localDir = join(userData, 'git', matched[2], matched[3]);
    } else {
        const parsed = parse(repo);

        const pathIdx = parsed.path.indexOf('.git');
        const srepo = parsed.path.substring(0, pathIdx);
        localDir = join(userData, 'git', srepo);
    }

    if (await pathExists(localDir)) {
        debug(`git fetch ${repo} in ${localDir}`);
        await simpleGit(localDir).fetch(null, null, ['--all']);

    } else {
        await ensureDir(localDir);
        debug(`git clone ${repo} in ${localDir}`);
        await simpleGit(localDir).clone(repo, '.');
    }

    const hashIdx = location.indexOf('#');
    if (hashIdx !== -1) {
        const hash = location.substr(hashIdx + 1);
        // TODO: check syntax

        await simpleGit(localDir).checkout(hash);
    }

    let projectFilePath = location.substr(gitIdx + 5);
    if (hashIdx !== -1)
        projectFilePath = projectFilePath.substring(0, projectFilePath.indexOf('#'));

    return join(localDir, projectFilePath);
}

export async function addAnnotatedTag(localgit: string, projectName: string, version: string) {
    return (simpleGit(localgit) as any).addAnnotatedTag(`v${version}`, `Tagging ${projectName} version ${version}`);
}

export async function getTags(localgit: string) {
    return simpleGit(localgit).tags();
}

export async function isGitRepo(localgit: string) {
    return (simpleGit(localgit) as any).revparse(['--is-inside-work-tree']);
}

export async function isGitClean(localgit: string) {
    const summary = await simpleGit(localgit).status();
    return summary.files.length === 0;
}

export async function gitCommit(localgit: string, message: string, files: string[] = [], options: any = {}) {
    return await (simpleGit(localgit) as any).commit(message, files, options);
}

export async function gitPush(localgit: string) {
    await simpleGit(localgit).push();
}

export async function gitRemotes(localgit: string) {
    return await (simpleGit(localgit) as any).getRemotes(true);
}

// Get git URL: assume origin/fetch|push defined
export async function gitURL(localgit: string) {
    const remotes = await gitRemotes(localgit);
    if (remotes) {
        const origin = remotes.find(remote => remote.name === 'origin');
        if (origin && origin.refs) {
            return origin.refs.fetch || origin.refs.push;
        }
    }
    return null;
}
