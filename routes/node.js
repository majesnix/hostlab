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

const router = require('express').Router();
const log = require('debug')('hostlab:route:node');
const slugify = require('slugify');
const Converter = require('ansi-to-html');
const ansiConverter = new Converter;
const sanitizeHtml = require('sanitize-html');
const fetchUserRepositories = require('../modules/retrieveUserGitlabProjects');
const { retrieveContainerLogs } = require('../common/docker');

router.get('/:name', async (req, res) => {
  const container = req.user.containers.node.find(
      e => slugify(e.name) === req.params.name);
  const containerLogs = (await retrieveContainerLogs(container._id)).map(
      e => sanitizeHtml(ansiConverter.toHtml(e), {
        allowedTags: ['span'],
        allowedAttributes: {
          'span': ['style'],
        },
      }));

  res.render('apps/details', {container, containerLogs});
});

router.get('/', async (req, res) => {
  try {
    const gitlab_id = req.user.gitlab_id;

    if(gitlab_id) {
      const repositories = await fetchUserRepositories(gitlab_id);

      let branches = {};
      if (repositories.length>0) { 
        branches = Object.assign(...repositories.map(repo => ({[repo.id]: repo.branches})));
      }

      if (repositories.length === 0) {
		  res.locals.message.info = `You got no repositories, create one on <a href="${process.env.GITLAB_URL}" target="_blank">Gitlab</a>`;
      }

      res.render('apps/overview', { repositories,branches });
    } else {
      res.locals.message.error = '[HOSTLAB] Gitlab ID not found';
      res.render('apps/overview', {});
    }
  } catch (err) {
    if (err.text) {
      res.locals.message.error = `[GITLAB] ${err.text}`;
      res.render('apps/overview', {});
    }
    console.error(err);
  }
});

module.exports = router;
