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
import { unsetCurrentProject } from '../storage';
import { syncProjectName } from './ui';

const usage = {
    header: 'Unset current project and return to namespace mode',
    example: 'project unset'
};

const doUnset = (_1, _2, _3, modules, _4, _5, _6, argv) => {
    if (argv.help)
        throw new modules.errors.usage(usage);

    unsetCurrentProject();
    syncProjectName();

    return true;
};

module.exports = (commandTree, prequire) => {
    commandTree.listen('/project/unset', doUnset);
};
