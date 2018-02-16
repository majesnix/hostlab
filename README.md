# HostLab

Web based hosting service for Node.js apps deployed directly from GitLab repos, built on Docker.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

First get a copy of this repo and browse into the directory

```bash
git clone https://github.com/jawys/hostlab.git
cd hostlab
```

### Installing

Install Docker and Compose (will take some time)

```bash
sh bin/scripts/install-docker-and-compose.sh
```

Check if everything worked out

```bash
docker -v
docker-compose -v
```

You should see at least these versions

```text
Docker version 17.12.0-ce, build c97c6d6
docker-compose version 1.18.0, build 8dd22a9
```

Create the config env file from our example

```bash
cp .env.example .env
```

Create some entries in your system's `/etc/hosts` file for connecting to HostLab and GitLab. In our example the hostnames `hostlab.local` and `gitlab.local` will be accessible under local IP addresses `127.0.0.10` and `127.0.0.11` respectively

```bash
sudo sh -c 'echo "127.0.0.10  hostlab.local" >> /etc/hosts'
sudo sh -c 'echo "127.0.0.11  gitlab.local" >> /etc/hosts'
```

Based on the above settings, complete the values of the `.env` file as follows

```dotenv
# [HOSTLAB]
HOSTLAB_DOMAIN=hostlab.local
HOSTLAB_IP=127.0.0.10
HOSTLAB_PORT=80
COMPOSE_PROJECT_NAME=hostlab

# [LDAP]
BINDDN=cn=admin,dc=hostlab,dc=local
BINDCREDENTIALS=12345
SEARCHBASE=dc=hostlab,dc=local
SEARCHFILTER=(mail={{username}})

# [DEV]
COMPOSE_FILE=docker-compose.yml:docker-compose.dev.yml
GITLAB_IP=127.0.0.11
```

You need an API token from GitLab first before using the whole system, so let GitLab run the first time (it will take a long time - hold on)

```bash
sudo docker-compose create gitlab && sudo docker-compose start gitlab
```

After some time browse to `http://gitlab.local` and set a password for the `root` user as requested

Navigate to `http://gitlab.local/profile/personal_access_tokens` and create an access token given the scopes **api** and **sudo**

Copy the access token to clipboard and add it into the `.env` file as follows

```dotenv
# [GITLAB]
GITLAB_TOKEN=YOUR-ACCESS-TOKEN-HERE
```

Next go to `http://gitlab.local/admin/application_settings` and disable the following checkboxes:

* **Sign-up enabled** in *Sign-up Restrictions*
* **Password authentication enabled for web interface** in *Sign-in Restrictions* 
* **Password authentication enabled for Git over HTTP(S)** in *Sign-in Restrictions*

Scroll to bottom and hit **Save** to apply the changed settings, then sign out

Stop and remove the temporary GitLab service

```bash
sudo docker-compose stop gitlab && sudo docker-compose rm -f gitlab
```

Finally let Compose build up all the services together

```bash
sudo docker-compose up -d
```

Go to `http://hostlab.local/` and sign in as `admin@example.com:12345`

<!--
## Deployment

Add additional notes about how to deploy this on a live system

## Built With

* [Framework](https://) - Some framework used
* [Tool1](https://) - Fancy tool
* [Tool2](https://) - Used to do this and that
-->

## Versioning

We use [SemVer](https://semver.org/) for versioning.

## Authors

```text
Copyright 2018 Adrian Beckmann, Denis Paris, Dominic Claßen,
               Jan Wystub, Manuel Eder, René Heinen, René Neißer.
```

See also the list of [contributors](../../contributors) who participated in this project.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
