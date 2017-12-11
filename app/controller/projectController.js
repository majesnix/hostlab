const fs = require('fs');
const passwordgen = require('password-generator');
const bcrypt = require('bcrypt');
const { Project, ProjectParticipant, Application, Database, User } = require('../db');
const snek = require('snekfetch');
const { gitlabURL, gitlabAdmin, gitlabToken } = require('../../config');
const Docker = require('dockerode');
var testDocker = new Docker();

module.exports.createProject = async (req, res) => {
  //create DB entry in projectdatabase (FK -> Matrikelnummer)
  //create folders for 
  // TODO: check project quota
  const name = req.body.name;
  const matrnr = req.user.user.matrnr;

  try {
    const project = await Project.create({ userid: matrnr, name: name });
    const dbUser = await User.findOne({ where: { matrnr: matrnr } });

    if (!fs.existsSync(`storage/${project.id}`)) {
      fs.mkdir(`storage/${project.id}`, async (err) => {
        if (err) {
          return console.error(err);
        }
      });
    }
    
    // create project
    const { text } = await snek.post(`${gitlabURL}/api/v4/projects/user/${dbUser.gitlabid}?private_token=${gitlabToken}&sudo=${gitlabAdmin}&name=${name}&visibility=private`);
    const parsedRes = JSON.parse(text);

    project.update({ gitlabid: parsedRes.id });

    // Add deploy key to project
    //const deployResponse = await snek.post(`${gitlabURL}/api/v4/projects/${parsedRes.id}/deploy_keys?private_token=${gitlabToken}&sudo=${gitlabAdmin}&title=deploykey&key=${key}`);

    req.flash('info', 'Project created');
    res.redirect('/dashboard');
  } catch (err) {
    req.flash('error', 'Project could not be created');
    console.error(err);
    res.redirect('/dashboard');
  }
};

module.exports.deleteProject = async (req, res) => {
  //delete folders of the project
  //delete DB entry
  const id = req.body.id;

  try {
    const project = await Project.findOne({ where: { id: id }});

    if (fs.existsSync(`storage/${project.id}`)) {
      fs.rmdir(`storage/${project.id}`, async (err) => {
        if (err) {
          return console.error(err);
        }
      });
    }

    await Project.destroy({ where: { id: id }});

    req.flash('info', 'Project deleted');
    res.redirect('/dashboard');
  } catch (err) {
    req.flash('error', 'Project could not be deleted');
    console.error(err);
    res.redirect('/dashboard');
  }
};

module.exports.changeProjectName = async (req, res) => {
  const name = req.body.newname;
  const project = req.body.id;

  try {
    await Project.update({ name: name },{ where: { id : project } });
    req.flash('info', 'Successfully change the project name');
    res.redirect(`/settings?id=${project}`);
  } catch (err) {
    req.flash('error', 'Projectname could not be changed');
    console.error(err);
    res.redirect(`/settings?id=${project}`);
  }
};

module.exports.addParticipant = async (req, res) => {
  const matrnr = req.body.matrnr;
  const project = req.body.id;

  try {
    await ProjectParticipant.create({ userid: matrnr, projectid: project });
    const dbProject = await Project.findOne({ where: { id: project } });
    const dbUser = await User.findOne({ where: { matrnr: matrnr } });

    await snek.post(`${gitlabURL}/api/v4/projects/${dbProject.gitlabid}/members?private_token=${gitlabToken}&sudo=${gitlabAdmin}&user_id=${dbUser.gitlabid}&access_level=30`);

    req.flash('info', 'Participant added');
    res.redirect(`/settings?id=${project}`);
  } catch (err) {
    req.flash('error', 'Participant could not be added');
    console.error(err);
    res.redirect(`/settings?id=${project}`);
  }
};

module.exports.removeParticipant = async (req, res) => {
  const matrnr = req.body.matrnr;
  const project = req.body.id;

  try {
    await ProjectParticipant.destroy({ where: { userid: matrnr, projectid: project } });
    const dbProject = await Project.findOne({ where: { id: project } });
    const dbUser = await User.findOne({ where: { matrnr: matrnr } });

    await snek.delete(`${gitlabURL}/api/v4/projects/${dbProject.gitlabid}/members/${dbUser.gitlabid}?private_token=${gitlabToken}&sudo=${gitlabAdmin}`);

    req.flash('info', 'Participant removed');
    res.redirect(`/settings?id=${project}`);
  } catch (err) {
    req.flash('error', 'Participant could not be deleted');
    console.error(err);
    res.redirect(`/settings?id=${project}`);
  }
};

module.exports.createApplication = async (req, res) => {
  //create new entry in application db (FK -> Projectid)
  //create folder for application
  const name = req.body.name;
  const project = req.body.id;
  const type = req.body.type;
  const port = req.body.port;

  try {
    const application = await Application.create({ projectid: project, name: name, type: type, port: port, path: '/not/an/actual/path'});

    if (!fs.existsSync(`storage/${project}/apps`)) {
      fs.mkdir(`storage/${project}/apps`, async (err) => {
        if (err) {
          return console.error(err);
        }
      });
    }

    if (!fs.existsSync(`storage/${project}/apps/${application.id}`)) {
      fs.mkdir(`storage/${project}/apps/${application.id}`, async (err) => {
        if (err) {
          return console.error(err);
        }
      });
    }

    testDocker.createContainer({Image: 'nginx', ExposedPorts: {'80/tcp': {}}, name: 'softwarelab_'+application.id, 'HostConfig': {'PortBindings':{'80/tcp':[{'HostPort': port}]}}}, (err, container) => {
      container.start((err, data) => {

      });
    });

    req.flash('info', 'Application created');
    res.redirect(`/project?id=${project}`);
  } catch (err) {
    req.flash('error', 'Application could not be created');
    console.error(err);
    res.redirect(`/project?id=${project}`);
  }
};

module.exports.deleteApplication = async (req, res) => {
  //delete folder of application
  //delete DB entry
  const id = req.body.appid;
  const project = req.body.project;

  try {

    if (fs.existsSync(`storage/${project}/apps/${id}`)) {
      fs.rmdir(`storage/${project}/apps/${id}`, async (err) => {
        if (err) {
          return console.error(err);
        }
      });
    }

    var container = testDocker.getContainer('softwarelab_'+id);
    container.stop((err, data) => {
      container.remove((err, data) => {
        console.log(err);
      });
    });

    await Application.destroy({ where: { id: id } });
    req.flash('info', 'Application deleted');
    res.redirect(`/project?id=${project}`);
  } catch (err) {
    req.flash('error', 'Application could not be deleted');
    console.error(err);
    res.redirect(`/project?id=${project}`);
  }
};

module.exports.createDatabase = async (req, res) => {
  //identify by database owner? save db owner in user->databases table
  //create new database (FK -> Projectid)
  //query to create database/user/pw -> grant privileges for new created user
  const name = req.body.name;
  const project = req.body.id;
  const type = req.body.type;

  const pw = passwordgen(8, false);
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(pw, salt);

  try {
    const database = await Database.create({ projectid: project, name: name, username: 'username', password: hashedPassword, salt: salt });
    // TODO: create actual database

    if (!fs.existsSync(`storage/${project}/db`)) {
      fs.mkdir(`storage/${project}/db`, async (err) => {
        if (err) {
          return console.error(err);
        }
      });
    }

    if (!fs.existsSync(`storage/${project}/db/${database.id}`)) {
      fs.mkdir(`storage/${project}/db/${database.id}`, async (err) => {
        if (err) {
          return console.error(err);
        }
      });
    }

    req.flash('info', 'Database created');
    res.redirect(`/project?id=${project}`);
  } catch (err) {
    req.flash('error', 'Database could not be created');
    console.error(err);
    res.redirect(`/project?id=${project}`);
  }
};

module.exports.deleteDatabase = async (req, res) => {
  //delete database
  const id = req.body.dbid;
  const project = req.body.project;

  try {
    if (fs.existsSync(`storage/${project}/db/${id}`)) {
      fs.rmdir(`storage/${project}/db/${id}`, async (err) => {
        if (err) {
          return console.error(err);
        }
      });
    }
    await Database.destroy({ where: { id: id } });
    //TODO: delete actual database

    req.flash('info', 'Database deleted');
    res.redirect(`/project?id=${project}`);
  } catch (err) {
    req.flash('error', 'Database could not be deleted');
    console.error(err);
    res.redirect(`/project?id=${project}`);
  }
};