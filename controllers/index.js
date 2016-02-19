'use strict';


var IndexModel = require('../models/index'),
    ProfileModel = require('../models/profile'),
    auth = require('../lib/auth'),
    user = require('../models/user'),
    Project = require('../models/projectModel');

module.exports = function (router) {
    var indexmodel = new IndexModel();
    var profilemodel = new ProfileModel();
    var promise = require('bluebird');


    router.get('/', function (req, res) {
        res.render('index', indexmodel);
    });

    router.get('/profile', function (req, res) {
        res.render('profile', profilemodel);
    });

    /* Getting Home Page */
    router.get('/home', function (req, res) {
        console.log("home " + req.session.userName);
        user.find({login: req.session.userName}, function (err, docs) {
            if (err) res.json(err);
            else {
                console.log("docs" + docs[0]._id);
                Project.find({"members.memberId": docs[0]._id}, function (err, proj) {
                    if (err) {
                        res.json(err);
                    } else {
                        console.log("proj" + proj);
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

    router.get('/signup', function (req, res) {
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

        var newUser = new user({name: name, login: login, password: password, role: role});
        newUser.save(function (err) {
            if (err) {
                console.log('save error', err);
                res.json("Username is not unique");

            } else {

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

        function sprintDetail() {
            console.log("inside the sprintDetail funciton");
            var msg = "Start Date must be less than End Date";
            var times = noOfSprint();
            var strt = new Date(startDate);
            var end = new Date(endDate);
            var sprints = [];
            for (var i = 0; i < times; i++) {
                console.log("inside the forloop funciton");
                var sprintDetails = {};
                sprintDetails.sprintNo = i + 1;
                var strt = new Date(startDate);
                strt.setDate(strt.getDate() + ((sprintDuration * 7 * (i)) + 1));
                strt = strt.toUTCString();
                strt = strt.split(" ").slice(0, 4).join(" ");
                console.log("str" + strt);
                sprintDetails.sprintStartDate = strt;
                var end = new Date(startDate);
                end.setDate(end.getDate() + (sprintDuration * 7 * (i + 1)));
                end = end.toUTCString();
                end = end.split(" ").slice(0, 4).join(" ");
                console.log("end" + end);
                sprintDetails.sprintEndDate = end;
                sprints.push(sprintDetails);
            }
            return sprints;
        }

        var teamno = req.body.teamno && req.body.teamno.trim();
        var teamname = req.body.teamname && req.body.teamname.trim();
        if (projectName === '') {
            res.redirect('/home#BadInput');
            return;
        }
        console.log("before call");
        function noOfSprint() {
            console.log("inside the noOfSprint funciton");
            return (Math.floor((Math.floor((new Date(endDate) - new Date(startDate)) / (24 * 3600 * 1000 * 7))) / sprintDuration));
        }

        var newProject = new Project({
            projectName: projectName,
            projectNo: projectNo,
            startDate: startDate,
            endDate: endDate,
            releases: releases,
            sprintDuration: sprintDuration,
            noOfSprint: noOfSprint(),
            sprintDetails: sprintDetail(),
            teamno: teamno,
            teamname: teamname

        });
        newProject.save(function (err) {
            if (err) {
                console.log("Inside err" + err);
            }
            res.redirect('/project');

        });
    });


    /**
     * Delete a project.
     * @paaram: req.body.item_id Is the unique id of the product to remove.
     */
    router.get('/project/:id/delete', function (req, res) {
        Project.remove({_id: req.params.id}, function (err) {
            if (err) {
                console.log('Remove error: ', err);
            }
            res.redirect('/project');
        });
    });


    /**
     * getting  a editproject page
     */


    router.get('/project/:id/edit', function (req, res) {

        Project.find({_id: req.params.id}, function (err, docs) {
            if (err) {
                res.json(err);
            }
            else
                res.render('project/editproject', {projects: docs[0]});
        });
    });
    /*
     editing project details
     */
    router.post('/project/:id', function (req, res) {
        Project.update({_id: req.params.id}, {
                projectName: req.body.projectName,
                projectNo: req.body.projectNo,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                releases: req.body.releases,
                sprintDuration: req.body.sprintDuration,
                teamno: req.body.teamno,
                teamname: req.body.teamname,
            },
            function (err, docs) {
                if (err) res.json(err);

                else {
                    console.log(docs);
                    res.redirect('/project');
                }
            });
    });
    /** Linking a project with its sprint*/
    router.get('/project/:id/sprint', function (req, res) {
        Project.find({_id: req.params.id}, function (err, docs) {
            if (err) {
                res.json(err);
            }
            else
                res.render('project/sprint', {projects: docs[0]});
        });
    });
    /** Linking a sprint with its sprintDetails*/

    router.get('/project/:id/sprintDetails/:sprintNo', function (req, res) {
        Project.find({_id: req.params.id, "sprintDetails.sprintNo": req.params.sprintNo}, {"sprintDetails.$": 1},
            function (err, docs) {
                if (err) {
                    res.json(err);
                }
                else {
                    console.log("sprintdetails" + docs[0]);
                    res.render('project/sprintDetails', {projects: docs[0]});
                }
            });
    });
    /* router.get('/project/:id/sprint').then(function(proj)
     {
     return new Promise(Project.find({_id:req.params.id}));
     }).then(function(docs) {
     render('project/sprintDetails', {projects: docs[0]});
     })
     .catch(function(err){
     res.json(err);
     }); */

    /*** Linking a project with its details*/
    router.get('/project/:id', function (req, res) {
        Project.find({_id: req.params.id}, function (err, docs) {
            if (err) {
                res.json(err);
            }
            else
                res.render('project/projectdetails', {projects: docs[0]});
        });
    });
    /* Getting Story Main page */
    router.get('/:id/:sprintNo/addStory', function (req, res) {
        Project.find({_id: req.params.id, "sprintDetails.sprintNo": req.params.sprintNo}, {
                "members": 1,
                "sprintDetails.$": 1
            },
            function (err, docs) {
                if (err) {
                    res.json(err);
                }
                else {
                    console.log("Add story sprintdetails" + docs[0]);
                    res.render('story/story', {projects: docs[0]});
                }

            });
    });

    router.get('/:id/addMember', function (req, res) {
        Project.find({_id: req.params.id}, function (err, docs) {
            if (err) {
                res.json(err);
            }
            else
                res.render('member/addMember', {projects: docs[0]});

        });
    });


    router.post('/addMember/:id', function (req, res) {
        var log = user.find({login: req.body.memberId})
            .populate('members.memberId')
            .exec(function (err, docs) {
                console.log("posts:" + docs[0]);
                if (err) {
                    res.json(err);
                } else {
                    console.log("docs" + docs[0]._id);
                    Project.find({_id: req.params.id, "members.memberId": docs[0]._id},
                        function (err, proj) {
                            if (proj.length) {
                                Project.find({_id: req.params.id}, function (err, docs) {
                                    if (err) {
                                        res.json(err);
                                    }
                                    else
                                        res.render('member/addMember', {projects: docs[0]});

                                });
                            } else {
                                Project.update({_id: req.params.id},
                                    {
                                        $addToSet: {
                                            "members": {
                                                memberId: docs[0]._id,
                                                memberName: docs[0].name,
                                                memberEmail: docs[0].login
                                            }
                                        }
                                    }, function (err) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            console.log("Successfully added");
                                            Project.find({_id: req.params.id}, function (err, docs) {
                                                if (err) {
                                                    res.json(err);
                                                }
                                                else
                                                    res.render('member/addMember', {projects: docs[0]});

                                            });
                                        }
                                    })
                                /* end of update function */
                            }
                        });
                }
            });
    });
    router.get('/removeMember/:id/:memberId', function (req, res) {
        Project.update({_id: req.params.id, "members.memberId": req.params.memberId}, {
                $pull: {
                    members: {
                        memberId: req.params.memberId
                    }
                }
            },
            function (err, docs) {
                if (err) {
                    res.json(err);
                }
                else
                    Project.find({_id: req.params.id}, function (err, docs) {
                        if (err) {
                            res.json(err);
                        }
                        else
                            res.render('member/addMember', {projects: docs[0]});

                    });
            });
    });

    //getting show story
    router.get('/project/:id/:sprintNo/showStory', function (req, res) {
        console.log("show story" + req.params.id);
        console.log("sprintNo" + req.params.sprintNo);
        Project.find({_id: req.params.id, 'sprintDetails.sprintNo': req.params.sprintNo}, {"sprintDetails.$": 1},
            function (err, docs) {
                if (err) {
                    res.json(err);
                }
                else {
                    console.log("docs" + JSON.stringify(docs[0]));
                    res.render('project/showStory', {projects: docs[0]});
                }
            });
    });

    /**
     *Inserting stories into sprintDetails
     */
    router.post('/story/:id/:sprintNo', function (req, res) {
        console.log("hello" + JSON.stringify(req.body.name));
        Project.update({_id: req.params.id, "sprintDetails.sprintNo": req.params.sprintNo},
            {
                $push: {
                    "sprintDetails.$.story": {
                        $each: [{
                            "name": req.body.name,
                            "creator": req.body.creator,
                            "date": req.body.date,
                            "desc": req.body.desc,
                            "sprintNo": req.body.sprintNo,
                            "developer": req.body.developer,
                            "status": req.body.status
                        }],$sort:{name:1}
                    }
                    }
                }
            ,
            function (err, docs) {
                if (err) res.json(err);

                else {
                    console.log("story" + docs);
                    Project.find({_id: req.params.id, "sprintDetails.sprintNo": req.params.sprintNo}, {
                            "members": 1,
                            "sprintDetails.$": 1
                        },
                        function (err, docs) {
                            if (err) {
                                res.json(err);
                            }
                            else {
                                console.log("sprintdetails" + docs[0]);
                                res.render('story/story', {projects: docs[0]});
                            }

                        });
                }
            });
    });


    /*
     getting a story edit page
     */

    router.get('/project/:id/:sprintNo/edit/:name', function (req, res) {
        Project.find({_id: req.params.id, 'sprintDetails.sprintNo': req.params.sprintNo},
            function (err, docs) {
                if (err) {
                    res.json(err);
                }
                else {
                    console.log("edit" + docs[0]);
                    res.render('story/editstory', {projects: docs[0]});
                }
            });
    });

    /*
     Story updating

     router.get('/story/:id/:sprintNo/update/:name', function (req, res) {
     console.log("name"+JSON.stringify(req.params.name));
     Project.update({_id: req.params.id,"sprintDetails.sprintNo":req.params.sprintNo},
     {
     $addToSet: {
     "sprintDetails.$.story": {
     name: req.params.name,
     creator: req.params.creator.
     date: req.params.date,
     desc: req.params.desc,
     developer: req.params.developer,
     status: req.params.status

     }
     }
     },
     function (err, docs) {
     if (err) res.json(err);

     else {
     res.redirect('/project');

     }
     });
     }); */
    /*
     Stories under project
     */
    router.get('/:id/stories', function (req, res) {
        Project.find({_id: req.params.id},
            function (err, docs) {
                if (err) {
                    res.json(err);
                }
                else

                    res.render('story/storydetails', {projects: docs[0]});
            });
    });

    /* filter story  */
    router.post('/:id/story/filter', function (req, res) {
        console.log("id" + req.params.id);
        console.log("sprintNo" + req.body.sprintNo);
        Project.find({_id: req.params.id, 'sprintDetails.sprintNo': req.body.sprintNo}, {"sprintDetails.sprintNo.$": 1},
            function (err, docs) {
                if (err) {
                    res.json(err);
                }
                else {
                    console.log("story by sprintNo" + docs[0]);
                    res.render('project/storybydate', {projects: docs[0]});
                }
            });
    });


    /* search story  */
    router.post('/:id/story/search', function (req, res) {
        console.log("id" + req.params.id);
        console.log("sprintNo" + req.body.storyName);
        Project.find({_id: req.params.id, 'sprintDetails.story.name': req.body.storyName}, {"sprintDetails.story.$": 1},
            function (err, docs) {
                if (err) {
                    res.json(err);
                }
                else {
                    console.log("story by sprintNo" + docs[0]);
                    res.render('project/storybydate', {projects: docs[0]});
                }
            });
    });


    /* Search story by date

     router.post('/:id/story/sort', function (req, res) {

     Project.find({_id: req.params.id}, {_id: 0, "sprintDetails.sprintNo.$": 1}),
     function (err, docs) {
     if (err) {
     res.json(err);
     }
     else

     res.render('project/storybydate', {projects: docs[0]});
     });
     });

     */
    /*
     getting a story edit page
     */

    router.get('/story/:id/delete/:name', function (req, res) {
        Project.find({_id: req.params.id, 'story.name': req.params.name}, {"story.$": 1},
            function (err, docs) {
                if (err) {
                    res.json(err);
                }
                else
                    res.render('story/delstory', {projects: docs[0]});
            });
    });

    /**
     *Deleting stories from project
     */
    router.get('/story/:id/:sprintNo/delete/:name', function (req, res) {
        console.log("name" + JSON.stringify(req.params.name));
        Project.update({_id: req.params.id, "sprintDetails.sprintNo": req.params.sprintNo},
            {
                $pull: {
                    "sprintDetails.$.story": {
                        name: req.params.name
                    }
                }
            },
            function (err, docs) {
                if (err) res.json(err);

                else {
                    res.redirect('/project');

                }
            });
    });


    /*
     Team under project
     */
    router.get('/:id/team', function (req, res) {
        Project.find({_id: req.params.id},
            function (err, docs) {
                if (err) {
                    res.json(err);
                }
                else

                    res.render('team/team', {projects: docs[0]});
            });
    });

//Getting project Registration page
    router.get('/projectregistration', function (req, res) {

        res.render('project/projectregistration');
    });

};
