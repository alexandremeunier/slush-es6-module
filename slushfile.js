/*
 * slush-es6-module
 * https://github.com/alexandremeunier/slush-es6-module
 *
 * Copyright (c) 2015, Alexandre Meunier
 * Licensed under the MIT license.
 */

'use strict';

var gulp = require('gulp'),
  install = require('gulp-install'),
  conflict = require('gulp-conflict'),
  template = require('gulp-template'),
  rename = require('gulp-rename'),
  _ = require('underscore.string'),
  inquirer = require('inquirer'),
  path = require('path');

function format(string) {
  var username = string.toLowerCase();
  return username.replace(/\s/g, '');
}

var defaults = (function () {
  var workingDirName = path.basename(process.cwd()),
    homeDir, osUserName, configFile, user;

  if (process.platform === 'win32') {
    homeDir = process.env.USERPROFILE;
    osUserName = process.env.USERNAME || path.basename(homeDir).toLowerCase();
  }
  else {
    homeDir = process.env.HOME || process.env.HOMEPATH;
    osUserName = homeDir && homeDir.split('/').pop() || 'root';
  }

  configFile = path.join(homeDir, '.gitconfig');
  user = {};

  if (require('fs').existsSync(configFile)) {
    user = require('iniparser').parseSync(configFile).user;
  }

  return {
    appName: workingDirName,
    userName: osUserName || format(user.name || ''),
    authorName: user.name || '',
    authorEmail: user.email || '',
    buildFolder: 'lib',
    injectTemplate: 'No'
  };
})();

gulp.task('default', function (done) {
  var prompts = [{
    name: 'appName',
    message: 'What is the name of your project?',
    default: defaults.appName
  }, {
    name: 'appDescription',
    message: 'What is the description?'
  }, {
    name: 'appVersion',
    message: 'What is the version of your project?',
    default: '0.1.0'
  }, {
    name: 'authorName',
    message: 'What is the author name?',
    default: defaults.authorName
  }, {
    name: 'authorEmail',
    message: 'What is the author email?',
    default: defaults.authorEmail
  }, {
    name: 'userName',
    message: 'What is the github username?',
    default: defaults.userName
  }, {
    type: 'list',
    name: 'license',
    message: 'Choose your license type',
    choices: ['MIT', 'BSD', 'MPL-2.0'],
    default: 'MIT'
  }, {
    name: 'buildFolder',
    message: 'What is the build destination folder?',
    default: defaults.buildFolder
  }, {
    type: 'list',
    name: 'injectTemplate',
    message: 'Do you want to be able to inject lodash templates via require calls?',
    choices: ['Yes', 'No'],
    default: defaults.injectTemplate
  }, {
    type: 'confirm',
    name: 'moveon',
    message: 'Continue?'
  }];
  //Ask
  inquirer.prompt(prompts,
    function (answers) {
      if (!answers.moveon) {
        return done();
      }

      answers.appNameSlug = _.slugify(answers.appName);
      var d = new Date();
      answers.year = d.getFullYear();
      answers.date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();

      var files = [path.join(__dirname, '/templates/**')];

      if (answers.license !== 'BSD') {
        files.push('!' + path.join(__dirname, '/templates/LICENSE_BSD'));
      } 
      if (answers.license !== 'MIT') {
        files.push('!' + path.join(__dirname, '/templates/LICENSE_MIT'));
      }
      if (answers.license !== 'MPL-2.0') {
        files.push('!' + path.join(__dirname, '/templates/LICENSE_MPL-2.0'));
      }

      gulp.src(files)
        .pipe(template(answers))
        .pipe(rename(function (file) {
          if (answers.license === 'MIT') {
            var mit = file.basename.replace('LICENSE_MIT', 'LICENSE');
            file.basename = mit;
          } else if(answers.license === 'BSD') {
            var bsd = file.basename.replace('LICENSE_BSD', 'LICENSE');
            file.basename = bsd;
          } else {
            var mpl = file.basename.replace('LICENSE_MPL-2.0', 'LICENSE');
            file.basename = mpl;
          }
          if (file.basename[0] === '_') {
            file.basename = '.' + file.basename.slice(1);
          }
        }))
        .pipe(conflict('./'))
        .pipe(gulp.dest('./'))
        .pipe(install())
        .on('end', function () {
          done();
        });
    });
});
