var IndexModel = require('../models/index'),
    ProfileModel = require('../models/profile'),
    auth = require('../lib/auth'),
    user = require('../models/user'),
    Project = require('../models/projectModel')

module.exports = function (router) {
    var indexmodel = new IndexModel();
    var profilemodel = new ProfileModel();

    /* Getting Index Page */
    router.get('/', function (req, res) {
        res.render('index', indexmodel);
    });

    /* Getting User Profile Page */
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

    /** Retrieve a list of all Projects   */
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

    /* Render  signup page */
    router.get('/signup', function (req, res) {
        res.render('signup');
    });

    /* Post for signup */
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

    /** Allow the users to log out     */
    router.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/login');
    });

    /*Getting project Registration page */
    router.get('/projectregistration', function (req, res) {
        res.render('project/projectregistration');
    });

    /** * Add a new project to the database    */
    router.post('/home', function (req, res) {
        Project.find({'projectName': req.body.projectName}, function (err, docs) {
            if (docs.length) {
                console.log("Already projectName is present");
                res.redirect('/project');
            }
            else {
                console.log("backbone post");
                var projectName = req.body.projectName && req.body.projectName.trim();
                var projectNo = req.body.projectNo && req.body.projectNo.trim();
                var startDate = req.body.startDate && req.body.startDate.trim();
                var endDate = req.body.endDate && req.body.endDate.trim();
                var sprintDuration = req.body.sprintDuration && req.body.sprintDuration.trim();
                function sprintDetail() {
                    console.log("inside the sprintDetail funciton");
                    var msg = "Start Date must be less than End Date";
                    var times = noOfSprint();
                    var sprints = [];
                    for (var i = 0; i < times; i++) {
                        console.log("inside the forloop funciton");
                        var sprintDetails = {};
                        sprintDetails.sprintNo = i + 1;
                        var strt = new Date(startDate);
                        if (i == 0) {
                            strt.setDate(strt.getDate());
                        } else {
                            strt.setDate(strt.getDate() + ((sprintDuration * 7) * i ));
                        }
                        strt = strt.toUTCString();
                        strt = strt.split(" ").slice(0, 4).join(" ");
                        console.log("str" + strt);
                        sprintDetails.sprintStartDate = strt;
                        var end = new Date(startDate);
                        if (i == 0) {
                            end.setDate(end.getDate() + ((sprintDuration * 7) - 1));
                        } else {
                            end.setDate(end.getDate() + ((sprintDuration * 7 * (i + 1)) - 1));
                        }
                        end = end.toUTCString();
                        end = end.split(" ").slice(0, 4).join(" ");
                        console.log("end" + end);
                        sprintDetails.sprintEndDate = end;
                        sprints.push(sprintDetails);
                    }
                    return sprints;
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
                    sprintDuration: sprintDuration,
                    noOfSprint: noOfSprint(),
                    sprintDetails: sprintDetail(),
                });
                newProject.save(function (err) {
                    if (err) {
                        console.log("Inside err" + err);
                    }
                    res.redirect('/project');
                });
            }
        });
    });

    /*** Delete a project    * @paaram: req.params.id is the unique id of the project to remove     */
    router.get('/project/:id/delete', function (req, res) {
        Project.remove({_id: req.params.id}, function (err) {
            if (err) {
                console.log('Remove error: ', err);
            }
            res.redirect('/project');
        });
    });

    /** getting  a editproject page for project */
    router.get('/project/:id/edit', function (req, res) {
        Project.find({_id: req.params.id}, function (err, docs) {
            if (err) {
                res.json(err);
            }
            else
                res.render('project/editproject', {projects: docs[0]});
        });
    });

    /* posting the updated project details  into database   */
    router.post('/project/:id', function (req, res) {
        Project.update({_id: req.params.id}, {
                projectName: req.body.projectName,
                projectNo: req.body.projectNo,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                sprintDuration: req.body.sprintDuration,
            },
            function (err, docs) {
                if (err) res.json(err);
                else {
                    console.log(docs);
                    res.redirect('/project');
                }
            });
    });

    /** Linking a project with its sprint Details*/
    router.get('/project/:id/sprint', function (req, res) {
        Project.find({_id: req.params.id}, function (err, docs) {
            if (err) {
                res.json(err);
            }
            else
                res.render('project/sprintDetails', {projects: docs[0]});
        });
    });

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

    /*Rendering story registration page */
    router.get('/:id/addStory', function (req, res) {
        console.log("add story" + req.params.id);
        Project.find({_id: req.params.id}, {
                "members": 1
            },
            function (err, docs) {
                if (err) {
                    res.json(err);
                }
                else {
                    console.log("Add story sprintdetails" + docs[0]);
                    res.render('story/addStory', {projects: docs[0]});
                }
            });
    });

    /*** Retrieving Add Memeber page for a project*/
   router.get('/:id/addMember', function (req, res) {
       Project.find({_id: req.params.id}, function (err, docs) {
           if (err) {
               res.json(err);
           }
           else
               res.render('member/addMember', {projects: docs[0]});
       });
   });

    /*** updating memebers to the database*/
    router.post('/addMember/:id', function (req, res) {
        console.log("id" + req.params.id);
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

    /*** To delete members from the project*/
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

    /*** Retrieving list of storied from DB based on SprintNo*/
    router.get('/:name/:sprintNo/showStory', function (req, res) {
        console.log("show story" + req.params.name);
        console.log("sprintNo" + req.params.sprintNo);
        Project.aggregate({
                $match: {
                    "projectName": req.params.name,
                    story: {$elemMatch: {'sprintNo': req.params.sprintNo}}
                }
            },
            {$unwind: "$story"}, {$match: {"story.sprintNo": req.params.sprintNo}}, {
                $group: {_id: "$_id", "count": {$sum: 1}, story: {$addToSet: "$story"}}
            },
            function (err, docs) {
                if (err) {
                    res.json(err);
                }
                else {
                    console.log("story by sprintNo" + docs[0]);
                    res.render('story/storybydate', {projects: docs[0]});
                }
            });
    });

    /*     Listing all the Stories under project     */
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

    /* Filter stories based on sprintNo of the project  */
    router.post('/:name/story/filter', function (req, res) {
        console.log("id" + req.params.name);
        console.log("sprintNo" + req.body.sprintNo);
        Project.aggregate({
                $match: {
                    "projectName": req.params.name,
                    story: {$elemMatch: {'sprintNo': req.body.sprintNo}}
                }
            },
            {$unwind: "$story"}, {$match: {"story.sprintNo": req.body.sprintNo}}, {
                $group: {_id: "$_id", story: {$addToSet: "$story"}}
            },
            function (err, docs) {
                if (err) {
                    res.json(err);
                }
                else {
                    console.log("story by sprintNo" + docs[0]);
                    res.render('story/storybydate', {projects: docs[0]});
                }
            });
    });

    /* search story based on storyname */
    router.post('/:id/story/search', function (req, res) {
        console.log("id" + req.params.id);
        console.log("sprintNo" + req.body.storyName);
        Project.find({_id: req.params.id, 'story.name': req.body.storyName}, {"story.$": 1},
            function (err, docs) {
                if (err) {
                    res.json(err);
                }
                else {
                    console.log("story by sprintNo" + docs[0]);
                    res.render('story/storybydate', {projects: docs[0]});
                }
            });
    });

    /**     *Inserting stories into project     */
    router.post('/:id/addStory', function (req, res) {
        Project.find({_id: req.params.id, 'story.name': req.body.name}, function (err, docs) {
            if (docs.length) {
                res.redirect('/project');
            }
            else {
                console.log("add id" + JSON.stringify(req.params.id));
                Project.update({_id: req.params.id},
                    {
                        $push: {
                            "story": {
                                "name": req.body.name,
                                "creator": req.body.creator,
                                "date": req.body.date,
                                "desc": req.body.desc,
                                "sprintNo": req.body.sprintNo,
                                "developer": req.body.developer,
                                "status": req.body.status
                            }
                        }
                    },
                    function (err, docs) {
                        if (err) res.json(err);
                        else {
                            Project.find({_id: req.params.id},
                                function (err, docs) {
                                    if (err) {
                                        res.json(err);
                                    }
                                    else {
                                        console.log("all stories" + docs[0]);
                                        res.render('story/storydetails', {projects: docs[0]});
                                    }
                                });
                        }
                    });
            }
        });
    });

    /*    Listing all stories under project based on projectid    */
    router.get('/:id/stories', function (req, res) {
        Project.find({_id: req.params.id},
            function (err, docs) {
                if (err) {
                    res.json(err);
                }
                else {
                    console.log("all stories" + docs[0]);
                    res.render('story/storydetails', {projects: docs[0]});
                }
            });
    });

    /*     getting a story edit page     */
    router.get('/:id/edit/:name', function (req, res) {
        Project.find({_id: req.params.id, 'story.name': req.params.name}, {
                "story.$": 1,
                "members": 1,
                "sprintDetails": 1
            },
            function (err, docs) {
                if (err) {
                    res.json(err);
                }
                else
                    res.render('story/editstory', {projects: docs[0]});
            });
    });

    /*     Story updating     */
    router.post('/story/update/:id/:name', function (req, res) {
        console.log("body" + JSON.stringify(req.body));
        Project.update({_id: req.params.id, 'story.name': req.params.name},
            {
                $set: {
                    "story.$.name": req.body.name,
                    "story.$.creator": req.body.creator,
                    "story.$.date": req.body.date,
                    "story.$.desc": req.body.desc,
                    "story.$.developer": req.body.developer,
                    "story.$.status": req.body.status,
                    "story.$.sprintNo": req.body.sprintNo,
                }
            },
            function (err, docs) {
                if (err)
                    res.json(err);
                else {
                    console.log(docs);
                    res.redirect('/project');
                }
            });
    });

    /**     *Deleting stories from project     */
    router.get('/:id/delete/:name', function (req, res) {
        console.log("name" + req.params.name);
        Project.update({_id: req.params.id},
            {
                $pull: {
                    story: {
                        name: req.params.name
                    }
                }
            },
            function (err) {
                if (err) {
                    console.log('Remove error: ', err);
                }
                else {
                    Project.find({_id: req.params.id},
                        function (err, docs) {
                            if (err) {
                                res.json(err);
                            }
                            else
                                res.render('story/storydetails', {projects: docs[0]});
                        });
                }
            });
    });

    /* Listing all stories under the sprint*/
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

    /* Listing story with its Sprintdetails */
    router.get('/:id/addToSprint/:name', function (req, res) {
        Project.find({_id: req.params.id, 'story.name': req.params.name}, {"story.$": 1, "sprintDetails": 1},
            function (err, docs) {
                if (err) {
                    res.json(err);
                }
                else {
                    console.log("Add story sprintdetails" + docs[0]);
                    res.render('story/story', {projects: docs[0]});
                }
            })
    });

    /* Allocating a story for the Sprint*/
    router.post('/:id/add/:name', function (req, res) {
        console.log(req.body.sprintNo);
        console.log(req.params.id);
        console.log(req.params.name);
        Project.update({_id: req.params.id, "story.name": req.params.name},
            {
                $set: {
                    "story.$.sprintNo": req.body.sprintNo
                }
            },
            function (err, docs) {
                if (err) {
                    res.json(err);
                }
                else {
                    res.redirect('/project');
                }
            })
    });

    /* sort story by name in asc order*/
    router.post('/:name/story/sort', function (req, res) {
        Project.aggregate({$match: {"projectName": req.params.name}},
            {$unwind: "$story"}, {$sort: {"story.name": -1}}, {
                $group: {_id: "$_id", story: {$addToSet: "$story"}}
            },
            function (err, docs) {
                if (err) {
                    res.json(err);
                }
                else {
                    console.log("story by sprintNo" + docs[0]);
                    res.render('story/storybydate', {projects: docs[0]});
                }
            });

    });
/* Getting the status of the project */
    router.get('/:id/:name/showStatus', function (req, res) {
        Project.aggregate({$match: {"projectName": req.params.name}},
            {$unwind: "$story"}, {$group: {_id: "$_id", "count": {$sum: 1}, story: {$addToSet: "$story"}}},
            function (err, docs) {
                if (err)  res.json(err);
                else {
                    console.log("story count" + docs[0].count);
                    // if(docs[0].count!= 0){
                    var storiesCount = docs[0].count;
                    var percentageCompletion = 0;
                    var acceptedStories = 0;
                    var percentageProgress = 0;
                    Project.aggregate([{$unwind: "$story"}, {$match: {$and: [{"projectName": req.params.name}, {"story.status": "Accepted"}]}},
                            {
                                $group: {_id: "$_id", "count": {$sum: 1}}
                            }],
                        function (err, proj) {
                            if (err) {
                                res.json(err);
                            }
                            else {
                                if (proj.length) {
                                    console.log("accepted story count" + proj[0].count);
                                    acceptedStories = proj[0].count;
                                } else {
                                    acceptedStories = 0;
                                }
                                percentageCompletion = Math.round((acceptedStories / storiesCount) * 100);
                                percentageProgress = 100 - percentageCompletion;
                                console.log("percentageCompletion" + percentageCompletion);
                                console.log("percentageCompletion" + percentageProgress);
                                Project.update({_id: req.params.id}, {
                                        $set: {
                                            "completedStatus": percentageCompletion,
                                            "progressStatus": percentageProgress
                                        }
                                    },
                                    function (err) {
                                        if (err) res.json(err);
                                        else {
                                            Project.find({_id: req.params.id},
                                                function (err, doc) {
                                                    if (err) res.json(err);
                                                    else {
                                                        console.log("ans" + doc[0]);
                                                        res.render('project/progressBar', {projects: doc[0]});
                                                    }
                                                });
                                        }
                                    });

                            }
                        });
                }
            });
    });


};
