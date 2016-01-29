'use strict';


var IndexModel = require('../models/index'),
    ProfileModel = require('../models/profile'),
    auth = require('../lib/auth'),
    user = require('../models/user'),
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
        console.log("home "+ req.session.userName);
               user.find({login:req.session.userName},function(err,docs) {
                 if (err) res.json(err);
                   else {
                     Project.find({memberId: docs[0]._id}, function (err, proj) {
                         if (err) {
                             res.json(err);
                         } else {
                             console.log(proj);
                             res.render('layouts/home', {projects: proj});
                         }
                     });
                   }
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

        var newUser = new user({name: name,login: login,password: password,role: role});

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
              /*   var date1 = new Date(this.startDate);
                var date2 = new Date(this.endDate);
                var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                var noOfDays = diffDays; */
                var teamno = req.body.teamno && req.body.teamno.trim();
                var teamname = req.body.teamname && req.body.teamname.trim();
                              if (projectName === '') {
                    res.redirect('/home#BadInput');
                    return;
                }

                var newProject = new Project({
                    projectName: projectName,
                    projectNo: projectNo,
                    startDate: startDate,
                    endDate: endDate,
                    releases: releases,
                    sprintDuration: sprintDuration,
                    teamno: teamno,
                    teamname: teamname
                });
                newProject.save(function (error) {

                                res.redirect('/project');

                            })
                        });



      /**
     * Delete a project.
     * @paaram: req.body.item_id Is the unique id of the product to remove.
     */
    router.get('/project/delete', function (req, res) {
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
            },
            function(err,docs) {
                if (err) res.json(err);

                else {
                    console.log(docs);
                    res.redirect('/project');
                }
            });
    });
/* sprint details */
    router.get('/project/:id/sprint',function(req,res){

        Project.find({_id: req.params.id}, function (err,docs) {
            if (err) {
                res.json(err)   ;
            }
            else
                res.render('project/sprintDetails', {projects:docs[0]});
        });
    });
    /**
     * Linking a project with its details
     */

    router.get('/project/:id', function (req, res) {
        Project.find({_id: req.params.id}, function (err,docs) {
            if (err) {
                res.json(err);
            }
            else
                res.render('project/projectdetails', {projects:docs[0]});
        });
    });

    /*
     Getting Story Main page
     */
    router.get('/:id/story',function(req,res) {
        //  var databaseCategory = db.users.findOne( { _id: req.params.id } );
        //  db.categories.find( { left: { $gt: databaseCategory.left }, right: { $lt: databaseCategory.right } } );
        Project.find({_id: req.params.id}, function (err, docs) {
            if (err) {
                res.json(err);
            }
            else
                res.render('story/story', {projects:docs[0]});

        });
    });

    router.get('/:id/addMember',function(req,res) {
        Project.find({_id: req.params.id}, function (err, docs) {
            if (err) {
                res.json(err);
            }
            else
                res.render('member/addMember', {projects:docs[0]});

        });
    });
    router.post('/addMember/:id', function (req, res) {

        var login = user.find({login: req.body.memberId})
            .populate('memberId')
            .exec(function(err,docs){
                console.log("posts:"+docs[0]);
                if(err){
                    res.json(err);
                }else  {
                       console.log(docs[0]._id);
                          // Project.find({_id: req.params.id},function(err,docs) {
                            //   if (memberId === docs[0]._id) {
                              //     res.redirect('/home');                               }
                               //else {
                                   Project.update({_id: req.params.id},
                                       {
                                           $addToSet: {
                                               memberId: docs[0]._id,
                                               memberName: docs[0].name
                                           }
                                       }, function (err) {
                                           if (err) {
                                               console.log(err);
                                           } else {
                                               console.log("Successfully added");
                                               res.redirect('/home');

                                           }
                                       })
                               //}
                           //});
                }
            });
    });
    /**
     *Inserting stories into project
     */
    router.post('/story/:id', function (req, res) {
        console.log("hello"+JSON.stringify(req.body));
        Project.update({_id: req.params.id},
            {$push:
            { story: {
                name: req.body.name,
                creator: req.body.creator,
                date: req.body.date,
                desc: req.body.desc,
                sprintNo: req.body.sprintNo,
                developer: req.body.developer,
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
                else {
                    console.log("edit" + JSON.stringify(docs[0]));
                    res.render('story/editstory', {projects: docs[0]});
                }
            });
    });

    /*
     Story updating
     */
    router.post('/story/update/:id/:name',function(req,res){
        console.log("body"+JSON.stringify(req.body));
        Project.update({_id: req.params.id,'story.name':req.params.name},
            {$set:{
                "story.$.name":req.body.name,
                "story.$.creator":req.body.creator,
                "story.$.date":req.body.date,
                "story.$.desc":req.body.desc,
                "story.$.developer":req.body.developer,
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
    router.post('/story/delete/:id/:name', function (req, res) {
        Project.update({_id: req.params.id},
            {$pull:
            { story: {
                name: req.body.name
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
