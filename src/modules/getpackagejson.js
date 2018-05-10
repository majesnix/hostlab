/*
 * This file is part of The HostLab Software.
 *
 * Copyright 2018
 *     Adrian Beckmann, Denis Paris, Dominic Claßen, 
 *     Jan Wystub, Manuel Eder, René Heinen, René Neißer.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const snek = require('snekfetch');

/**
 * Retrieves the PackageJSON of the given Gitlab Repository (ID) and the given Branch
 * 
 * @module
 * @param {number} repositoryID The GitlabID of the repository
 * @param {string} [branch=master] The branch of the repository
 * @returns {Promise<Object>}
 * @example
 * // Retrieves the Package.json of the project with the ID 1 and branch 'master'
 * const info = await getPackageJSON('1');
 *
 * // Retrieves the Package.json of the project with the ID 1 and branch 'test'
 * const info = await getPackageJSON('1','test');
 */

module.exports = async (repositoryID, branch = 'master') => {
    const { text } = await snek.get(`${process.env.GITLAB_URL}/api/v4/projects/${repositoryID}/repository/files/package.json/raw?private_token=${process.env.GITLAB_TOKEN}&ref=${branch}`);
    return JSON.parse(text);
};
