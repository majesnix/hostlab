#!/bin/bash
#
# run gitlab in docker

sudo docker run --name gitlab \
--detach --restart always \
--hostname gitlab.local \
--publish 127.0.0.11:443:443 \
--publish 127.0.0.11:80:80 \
--publish 127.0.0.11:22:22 \
--volume /srv/gitlab/config:/etc/gitlab \
--volume /srv/gitlab/logs:/var/log/gitlab \
--volume /srv/gitlab/data:/var/opt/gitlab \
gitlab/gitlab-ce:latest

sudo sh -c 'echo "\n127.0.0.11\tgitlab.local" >> /etc/hosts'
