#!/bin/bash
#
# run mongodb in docker

sudo docker run \
--name hostlab-mongo \
--detach \
--restart always \
--publish 127.0.0.10:27017:27017 \
mongo:latest

sudo sh -c 'echo "\n127.0.0.10\thostlab.local" >> /etc/hosts'
