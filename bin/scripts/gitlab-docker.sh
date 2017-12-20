#!/bin/bash
#
# run gitlab in docker

export GITLAB_CONFIG=/media/sf_hostlab/config/gitlab.rb

sudo docker run --name gitlab \
--detach --restart always \
--hostname gitlab.local \
--publish 192.168.178.53:443:443 \
--publish 192.168.178.53:80:80 \
--publish 192.168.178.53:9022:22 \
--volume /srv/gitlab/config:/etc/gitlab \
--volume /srv/gitlab/logs:/var/log/gitlab \
--volume /srv/gitlab/data:/var/opt/gitlab \
gitlab/gitlab-ce:latest

sudo sh -c 'echo "\n192.168.178.53\tgitlab.local" >> /etc/hosts'
sudo docker cp ${GITLAB_CONFIG} gitlab:/etc/gitlab/gitlab.rb
