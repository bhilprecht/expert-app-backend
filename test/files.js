process.env.NODE_ENV = 'test'; //at the moment not needed

var mongoose = require("mongoose");
var app = require('../app').app;
var Exception = require('../models/schemas').exceptionSchema;

//provide an example JWT for test purpose
var authTokenExample = require('../config/database').authTokenExample;

//Require the dev-dependencies
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = require('chai').expect
var should = chai.should();
chai.use(chaiHttp);

var Exception = require('../models/schemas').exceptionSchema;
var User = require('../models/user');

describe('File routes', () => {

    var exceptionId;
    var commentId;

    beforeEach((done) => { //Before each test we add a single exception with a single comment
        var exception = new Exception({ 
                name:'testException', 
                description:'myDescription', 
                author:'henrik',
                date: '2017-10-18T16:45:06.969Z',
                comments: [
                    { content: 'body', author: 'henrik', date: '2017-10-18T16:45:06.969Z'}
               ]
        });
        exception.save((err, exception) => {
                exceptionId = exception._id;
                commentId = exception.comments[0]._id;
                var user = new User({username: 'benjaminfranklin', hash_password: '5k3</@3h4;%v;j&(/i=!S5=k6p%qwV5'});
                user.save((err, user) => {
                    done();
                }); 
        });     
    });

    afterEach((done) => { //After each test we empty the database
        User.remove({}, (err) => {
            Exception.remove({}, (err) => {
                done();         
            });         
        });   
    });

    describe('UPLOAD User Picture', function() {
        it('it should upload a new user picture', function(done) {
            chai.request(app)
                .post('/api/user/benjaminfranklin/picture')
                .set('authorization', authTokenExample)
                .attach('file', './test/testfiles/smiley.png')
                .end(function(err, res) {
                    res.should.have.status(200);
                    chai.request(app)
                        .get('/api/user/benjaminfranklin/picture')
                        .set('authorization', authTokenExample)
                        .end(function(err, res) {
                            res.should.have.status(200);
                            done();
                        });
            });
        });
    });

    describe('UPLOAD wrong user', function() {
        it('it should be rejected', function(done) {
            chai.request(app).post('/api/user/wronguser/picture')
                .set('authorization', authTokenExample)
                .attach('file', './test/testfiles/smiley.png')
                .end(function(err, res) {
                    res.should.have.status(400);
                    expect(res.body.message).to.equal('Error: User not found');
                    done();
            });
        });
    });

    describe('UPLOAD no file attached', function() {
        it('it should be rejected', function(done) {
            chai.request(app).post('/api/user/benjaminfranklin/picture')
                .set('authorization', authTokenExample)
                .end(function(err, res) {
                    res.should.have.status(500);
                    done();
            });
        });
    });

    describe('UPLOAD Exception Picture', function() {
        it('it should upload a new exception picture', function(done) {
            chai.request(app)
                .post('/api/exception/'+exceptionId+'/picture')
                .set('authorization', authTokenExample)
                .attach('file', './test/testfiles/smiley.png')
                .end(function(err, res) {
                    res.should.have.status(200);
                    Exception.findOne({name:'testException'},function(err,exception){
                        chai.request(app)
                            .get('/api/picture/'+exception.pictureurl)
                            .set('authorization', authTokenExample)
                            .end(function(err, res) {
                                res.should.have.status(200);
                                done();
                            });
                    })
            });
        });
    });

    describe('UPLOAD wrong exceptionId', function() {
        it('it should be rejected', function(done) {
            chai.request(app).post('/api/exception/wrongexceptionid/picture')
                .set('authorization', authTokenExample)
                .attach('file', './test/testfiles/smiley.png')
                .end(function(err, res) {
                    res.should.have.status(400);
                    expect(res.body.message).to.equal('Error: Exception not found');
                    done();
            });
        });
    });

    describe('UPLOAD Exception no file attached', function() {
        it('it should be rejected', function(done) {
            chai.request(app).post('/api/user/'+exceptionId+'/picture')
                .set('authorization', authTokenExample)
                .end(function(err, res) {
                    res.should.have.status(500);
                    done();
            });
        });
    });

    describe('GET non existing file', function() {
        it('it should be rejected', function(done) {
            chai.request(app)
                .get('/api/picture/pr0b4b1yn073x1s71ng')
                .set('authorization', authTokenExample)
                .end(function(err, res) {
                    res.should.have.status(400);
                    expect(res.body.message).to.equal('Error: Picture not found');
                    done();
            });
        });
    });

    describe('GET file without auth token', function() {
        it('it should be rejected', function(done) {
            chai.request(app)
                .get('/api/picture/pr0b4b1yn073x1s71ng')
                .end(function(err, res) {
                    res.should.have.status(401);
                    done();
            });
        });
    });
});