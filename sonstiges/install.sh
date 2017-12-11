#!/bin/bash

if [[ $EUID -ne 0 ]];
    then
    	echo "This script must be run as root" 
   		exit 1
fi

sudo apt install -y \
	curl \
	wget \
	build-essential \
	linux-image-extra-"$(uname -r)" \
    linux-image-extra-virtual \
    apt-transport-https \
    ca-certificates \
    software-properties-common

sudo apt-key fingerprint 0EBFCD88
sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
echo "deb http://nginx.org/packages/ubuntu/ xenial nginx\ndeb-src http://nginx.org/packages/ubuntu/ xenial nginx" | sudo tee /etc/apt/sources.list.d/nginx.list

sudo apt install -y yarn \
    postgresql \
    docker-ce \
    nodejs \
    nginx

sudo npm install pm2 -g

#TODO: ADD pm2 to startup