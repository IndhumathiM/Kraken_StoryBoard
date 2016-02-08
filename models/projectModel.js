    'use strict';

    var mongoose = require('mongoose'),
    schema = mongoose.Schema;
    var user = require('../models/user');


    var projectModel = function () {

    //Define a super simple schema for our stories.
    var projectSchema =  schema({
        projectName: { type: String, index: { unique: true }},
        projectNo:{ type: String, index: { unique: true }},
        startDate: String,
        endDate: String,
        releases:String,
        sprintDuration:String,
        sprintCount:String,
        teamname: String,
        teamno: String,
        noOfSprint:String,
        sprintDetails:[{
            sprintNo:String,
            sprintStartDate:String,
            sprintEndDate:String,
            storyId:[String],
            storyName:[String]
        }],

        memberId :[{type: schema.Types.ObjectId, ref: 'user'}],
        memberName: [String],
        story:[{
            name: String,
            creator: String,
            date: String,
            desc:String,
            developer:String,
            sprintNo: String,
            sprintStartDate: String,
            sprintEndDate: String,
            status: String
        }]
     });
    projectSchema.methods.storyStartDate = function () {
        return this.story.sprintNo *2;
    };
    return mongoose.model('Project', projectSchema);
    };
  module.exports = new projectModel();
