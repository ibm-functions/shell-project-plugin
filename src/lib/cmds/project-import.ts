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
import { sliceCmd, error, consume, checkExtraneous, checkExtraneousFlags } from './cli';
import { searchTemplates, formatAsTable } from '../catalog';
import { checkTools } from '../tools';
import { deploy } from '../deploy';

const usage = {
    title: 'Import a project template from github',
    header: '',
    example: 'import [<owner/repo>], import [<url>]',
    optional: [
        { name: '<owner/repo>', docs: 'the github repository containing the template' },
        { name: '<url>', docs: 'the github repository containing the template' },
        { name: '-p|--path', docs: 'path to the manifest file' }

    ]
};

const doImport = prequire => async (block, nextBlock, _3, { errors, ui }, _4, _5, _6, argv) => {
    if (argv.help)
        throw new errors.usage(usage);

    sliceCmd(argv, 'import');

    const repo = argv._.shift();

    checkExtraneous(errors, argv);

    const p = `/${consume(argv, ['p', 'path']) || 'manifest.yaml'}`;

    checkExtraneousFlags(errors, argv);

    if (!repo) {
        const repos = await searchTemplates();
        return formatAsTable(repos);
    } else {
        const err = await checkTools(block, nextBlock, { ui });
        if (err !== "")
            return error({ errors }, err);

        const url = repo.startsWith('https:') ? repo : `https://raw.githubusercontent.com/${repo}${p}`;
        return deploy(prequire, ui, url);
    }
};

module.exports = (commandTree, prequire) => {
    commandTree.listen('/project/import', doImport(prequire));
};
