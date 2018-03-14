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
import { sliceCmd, error, consume } from './cli';
import { run, getGlobalCredentials, prepareWskprops } from '../bluemix';
import * as parser from 'properties-parser';

const usage = {
    header: 'Create a new namespace',
    example: 'auth new [-o|--org <org>] [-s|--space <space>]',
    optional: [
        { name: '-o|--org  <org>', docs: 'Cloud foundry organization' }
    ],
    required: [
        { name: '-s|--space  <space>', docs: 'Cloud foundry space' }
    ]
};

const doNew = wsk => async (_1, _2, _3, { errors }, _4, _5, _6, argv) => {
    if (argv.help)
        throw new errors.usage(usage);

    sliceCmd(argv, 'new');

    const space = consume(argv, ['s', 'space']);
    if (!space)
        throw new errors.usage('missing space');

    let org = consume(argv, ['o', 'org']);

    const cred = await getGlobalCredentials();
    if (org)
        cred.org = org;

    if (!cred.org)
        throw new errors.usage('missing organization');

    cred.space = space;
    const filename = await prepareWskprops(cred, true);
    const wskprops = parser.read(filename);

    await wsk.auth.set(wskprops.AUTH);
    await wsk.apiHost.set(wskprops.APIHOST);
    return true;
};

module.exports = (commandTree, prequire) => {
    const wsk = prequire('/ui/commands/openwhisk-core');
    commandTree.listen('/auth/new', doNew(wsk));
};
