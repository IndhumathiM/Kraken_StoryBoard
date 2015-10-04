'use strict';


var IndexModel = require('../models/index'),
    ProfileModel = require('../models/profile'),
    User = require('../models/user'),
    auth = require('../lib/auth'),
    Project = require('../models/projectModel');


module.exports = function (router) {

    var indexmodel = new IndexModel();
    var profilemodel = new ProfileModel();


    router.get('/', function (req, res) {
        res.render('index', indexmodel);
    });


    router.get('/profile', function(req, res) {
        res.render('profile', profilemodel);
    });

    /* Getting Home Page */
    router.get('/home',function(req,res){

        Project.find(function (err,docs) {
            if (err) {
                res.json(err)   ;
            }
            else
                res.render('layouts/home');
        });
    });

    /**
     * Retrieve a list of all products for editing.
     */
    router.get('/project', function (req, res) {


        Project.find(function (err, prods) {
            if (err) {
                console.log(err);
            }

            var model =
            {
                projects: prods
            };
            res.render('project/project', model);
        });

    });



    /* Added for signup */

    router.get('/signup', function(req, res) {
        res.render('signup');
    });

    router.post('/signup', function (req, res) {

        var name = req.body.name && req.body.name.trim();
        var login = req.body.login && req.body.login.trim();
        var password = req.body.password && req.body.password.trim();
        var role = req.body.role && req.body.role.trim();

        if (name === '') {
            res.redirect('/user#BadInput');
            return;
        }

        var newUser = new User({name: name,login: login,password: password,role: role});

        /*
         The call back receives two more arguments -> product/s that is/are added to the database
         and number of rows that are affected because of save, which right now are ignored.
         We only check for errors.
         */
        newUser.save(function (err) {
            if (err) {
                console.log('save error', err);
                res.json("Username is not unique") ;

            }else {

                res.redirect('/login');
            }
        });
    });





    /**
     * Allow the users to log out
     */
    router.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/login');
    });
    /**
     * Add a new project to the database.
     */
    router.post('/home', function (req, res) {
        var projectName = req.body.projectName && req.body.projectName.trim();
        var projectNo = req.body.projectNo && req.body.projectNo.trim();
        var startDate = req.body.startDate && req.body.startDate.trim();
        var endDate = req.body.endDate && req.body.endDate.trim();
        var releases = req.body.releases && req.body.releases.trim();
        var sprintDuration = req.body.sprintDuration && req.body.sprintDuration.trim();
        /*  var sprintCount = Math.floor((Math.floor((new Date(endDate) - new Date(startDate)) / (24 * 3600 * 1000 * 7))) / sprintDuration); */
        var teamno = req.body.teamno && req.body.teamno.trim();
        var teamname = req.body.teamname && req.body.teamname.trim();
        var members =[ req.body.member1 && req.body.member1.trim(),
            req.body.member2 && req.body.member2.trim(),
            req.body.member3 && req.body.member3.trim(),
            req.body.member4 && req.body.member4.trim(),
            req.body.member5 && req.body.member5.trim()];





        if (projectName === '') {
            res.redirect('/home#BadInput');
            return;
        }

        var newProject = new Project({projectName: projectName,projectNo: projectNo,startDate: startDate,endDate: endDate,releases: releases,sprintDuration: sprintDuration,teamno: teamno,teamname: teamname,members:members});

        //Show it in console for educational purposes...
        newProject.whatAmI();

        /*
         The call back receives two more arguments -> product/s that is/are added to the database
         and number of rows that are affected because of save, which right now are ignored.
         We only check for errors.
         */
        newProject.save(function (err) {
            if (err) {
                console.log('save error', err);
            }

            res.redirect('/home');
        });
    });




    /**
     * Delete a project.
     * @paaram: req.body.item_id Is the unique id of the product to remove.
     */
    router.delete('/project', function (req, res) {
        Project.remove({_id: req.body.item_id}, function (err) {
            if (err) {
                console.log('Remove error: ', err);
            }
            res.redirect('/project');
        });
    });


    /**
     * getting  a editproject page
     */


    router.get('/project/:id/edit',function(req,res){

        Project.find({_id: req.params.id}, function (err,docs) {
            if (err) {
                res.json(err)   ;
            }
            else
                res.render('project/editproject', {projects:docs[0]});
        });
    });
    /*
     editing project details
     */
    router.post('/project/:id',function(req,res){
        Project.update({_id: req.params.id}, {
                projectName:req.body.projectName,
                projectNo:req.body.projectNo,
                startDate:req.body.startDate,
                endDate:req.body.endDate,
                releases:req.body.releases,
                sprintDuration:req.body.sprintDuration,
                teamno:req.body.teamno,
                teamname:req.body.teamname,
                members:[ req.body.member1,
                          req.body.member2,
                          req.body.member3,
                          req.body.member4,
                          req.body.member5]



            },
            function(err,docs) {
                if (err) res.json(err);

                else {
                    console.log(docs);
                    res.redirect('/project');
                }
            });
    });

    /**
     * Linking a project with its details
     */

    router.get('/project/:id', function (req, res) {
        Project.find({_id: req.params.id}, function (err,docs) {
            if (err) {
                res.json(err)   ;
            }
            else
                res.render('project/projectdetails', {projects:docs[0]});
        });
    });

    /*
     Getting Story Main page
     */
    router.get('/:id/story',function(req,res) {

        Project.find({_id: req.params.id}, function (err, docs) {
            if (err) {
                res.json(err);
            }
            else
                res.render('story/story', {projects:docs[0]});

        });
    });


    /**
     *Inserting stories into project
     */
    router.post('/story/:id', function (req, res) {

        Project.update({_id: req.params.id},
            {$push:
            { story: {
                name: req.body.name,
                creator: req.body.creator,
                date: req.body.date,
                desc: req.body.desc,
                sprintNo: req.body.sprintNo,
                teamMember: req.body.teamMember,
                status: req.body.status


            }}},
            function(err,docs) {
                if (err) res.json(err);

                else {
                    console.log(docs);
                    res.redirect('/project');
                }
            });
    });


    /*
     getting a story edit page
     */

    router.get('/story/:id/edit/:name',function(req,res){
        Project.find({_id: req.params.id,'story.name':req.params.name},{"story.$":1},
            function (err,docs) {
                if (err) {
                    res.json(err)   ;
                }
                else
                    res.render('story/editstory', {projects:docs[0]});
            });
    });

    /*
     Story updating
     */
    router.post('/story/update/:id/:name',function(req,res){
        Project.update({_id: req.params.id,'story.name':req.params.name},
            {$set:{
                "story.$.name":req.body.name,
                "story.$.creator":req.body.creator,
                "story.$.date":req.body.date,
                "story.$.desc":req.body.desc,
                "story.$.sprintNo":req.body.sprintNo,
                "story.$.teamMember":req.body.teamMember,
                "story.$.status":req.body.status


            }},
            function(err,docs) {
                if (err)
                    res.json(err);

                else {
                    console.log(docs);
                    res.redirect('/project');
                }
            });
    });

    /*
     Stories under project
     */
    router.get('/:id/stories',function(req,res){
        Project.find({_id: req.params.id},
            function (err,docs) {
                if (err) {
                    res.json(err);
                }
                else

                    res.render('story/storydetails',{projects:docs[0]});
            });
    });

    /* Search story by name */
    router.post('/:id/story/search/name',function(req,res){

        Project.find({_id: req.params.id,'story.name':req.body.storyName},{_id:0,"story.$":1},
            function (err,docs) {
                if (err) {
                    res.json(err);
                }
                else

                    res.render('project/storybydate',{projects:docs[0]});
            });
    });


    /* Search story by date */

    router.post('/:id/story/search/date',function(req,res){

        Project.find({_id: req.params.id,'story.date':req.body.releaseDate},{_id:0,"story.$":1},
            function (err,docs) {
                if (err) {
                    res.json(err);
                }
                else

                    res.render('project/storybydate',{projects:docs[0]});
            });
    });


    /*
     getting a story edit page
     */

    router.get('/story/:id/delete/:name',function(req,res){
        Project.find({_id: req.params.id,'story.name':req.params.name},{"story.$":1},
            function (err,docs) {
                if (err) {
                    res.json(err)   ;
                }
                else
                    res.render('story/delstory', {projects:docs[0]});
            });
    });

    /**
     *Deleting stories from project
     */
    router.get('/story/delete/:id/:name', function (req, res) {
        Project.update({_id: req.params.id,'story.name':req.params.name},
            {$pull:
            { story: {
                name: req.body.name,
                creator: req.body.creator,
                date: req.body.date,
                desc: req.body.desc,
                sprintNo: req.body.sprintNo



            }}},
            function (err) {
                if (err) {
                    console.log('Remove error: ', err);
                }
                res.redirect('/project');
            });
    });


    /*
     Team under project
     */
    router.get('/:id/team',function(req,res){
        Project.find({_id: req.params.id},
            function (err,docs) {
                if (err) {
                    res.json(err);
                }
                else

                    res.render('team/team',{projects:docs[0]});
            });
    });

//Getting project Registration page
    router.get('/projectregistration', function(req, res) {
        res.render('project/projectregistration');
    });



};
