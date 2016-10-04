'use strict';

var chai = require('chai');
var expect = chai.expect;
var should = chai.should();

var repo = require(process.cwd()+'/repo');
var settings = require(process.cwd() + '/private/settings.js');
var firebase = require('firebase');

firebase.initializeApp({
  serviceAccount: process.cwd() + '/private/serviceAccountCredentials.json',
  databaseURL: settings.FIREBASE.BASEURL
});
var db = firebase.database();

// create a testData.js and put it in /private
// take a few users from the db and add them in an object replacing their
// IDs (keys) with user1, user2, etc...
var testData = require(process.cwd() + '/private/testData.js');

/* global describe, it, before, after */
describe('Firebase user info tests', function(){
  var testUser1  = testData.user1;

  before(function(done){
    var updateRef = db.ref('test/users').child(testUser1.id);
    updateRef.update(testUser1).then(function(){
      var killUser = db.ref('test/users').child("111000");
      killUser.set(null, function(err){
        done();
      });
    }).catch(function(err){
      console.log(err);
      done();
    });
  });
  
  it('Should add one prop point to user', function(done){
    repo.incrementUser(db, testUser1, "props", function(user){
      expect(user.props).to.equal(1);
      done();
    });
  });

  it('Should add one flow point to user', function(done){
    repo.incrementUser(db, testUser1, "flow", function(user){
      expect(user.flow).to.equal(1);
      done();
    });
  });

  it('Should find user by ID', function(done){
    repo.findUserById(db, testUser1.id, function(user){
      expect(user.flow).to.equal(1);
      expect(user.username).to.equal(testUser1.username);
      expect(user).to.be.a("object");
      done();
    });
  });

  it('Should update user info', function(done){
      var newdata = {
        'dubs': 100,
        'flow' : 300,
        'props' : 2
      };
    repo.updateUser(db, testUser1.id, newdata, function(result){
      repo.findUserById(db, testUser1.id, function(user){
        expect(user.flow).to.equal(300);
        expect(user.dubs).to.equal(100);
        expect(user.props).to.equal(2);
        done();
      });
    });
  });

  it('Should insert new user data', function(done){
    var newUser = {
      'dubs': 500,
      'id' : "111000",
      "username": "stupidface"
    };
    repo.insertUser(db, newUser, function(result){
      repo.findUserById(db, "111000", function(user){
        expect(user.flow).to.equal(0);
        expect(user.dubs).to.equal(500);
        expect(user.props).to.equal(0);
        expect(user.username).to.equal("stupidface");
        done();
      });
    });
  });

  it('Should get top 3 flow leaders of points', function(done){
    repo.getLeaders(db, "flow", 3, function(items){
      expect(items).to.be.a('object');
      expect(items[testUser1.id].flow).to.equal(300);
      done();
    });
  });

  
});

describe("Firebase Trigger test", function(){
  
  before(function(done){
    db.ref('test/triggers').set(null);
    db.ref('test/triggers').push().set({
        Author: 'stupidface',
        Returns: 'Buttafuoco ova here!',
        Trigger: 'buttaface:'
    }).then(function(){
      db.ref('test/triggers').push().set({
          Author: 'banana',
          Returns: 'something something',
          Trigger: 'darkside:'
      }).then(function(){
        done();
      });
    });
  });

  var buttaKey = null;
  it('Should get trigger by triggerName', function(done){
    repo.getTrigger({}, db, 'buttaface', function(val){
      var keys = Object.keys(val);
      buttaKey = keys[0];
      var theReturn = val[keys[0]].Returns;
      expect(theReturn).to.equal('Buttafuoco ova here!');
      done();
    });
  });

  it('Should delete trigger by trigger key', function(done){
    repo.deleteTrigger(db, buttaKey)
      .then(function(){
        db.ref('test/triggers/' + buttaKey).once('value', function(snap){
          should.not.exist(snap.val());
          done();
        });
      });
  });

  it('Should create trigger by triggerName', function(done){
    var data = {};
    data.triggerName = 'blabla';
    data.triggerText = 'Bob Loblaw Law Blog';
    data.user = { username: 'person' };
    repo.insertTrigger(db, data)
      .then(function(){
        repo.getTrigger({}, db, 'blabla', function(val){
              var keys = Object.keys(val);
              buttaKey = keys[0];
              var theReturn = val[keys[0]].Returns;
              expect(theReturn).to.equal('Bob Loblaw Law Blog');
              done();
            });
      });
  });

  it('Should update trigger by triggerName', function(done){
    var data = {};
    data.triggerName = 'darkside';
    data.triggerText = 'I am the new thing';
    data.user = { username: 'person' };
    
    var darkKey = null;

    repo.getTrigger({}, db, 'darkside', function(val){
      var keys = Object.keys(val);
      darkKey = keys[0];
      
        repo.updateTrigger(db, data, darkKey)
          .then(function(){
            
            repo.getTrigger({}, db, 'darkside', function(val){
                  var keys = Object.keys(val);
                  buttaKey = keys[0];
                  var theReturn = val[keys[0]].Returns;
                  expect(theReturn).to.equal('I am the new thing');
                  done();
                });
        });
    });

  });
});