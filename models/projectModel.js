    'use strict';

    var mongoose = require('mongoose'),
    schema = mongoose.Schema;
    var user = require('../models/user');


    var projectModel = function () {
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
            sprintNo: String,
            sprintStartDate: String,
            sprintEndDate: String,
            story: [{
                name: { type: String, index: { unique: true }},
                creator: String,
                date: String,
                desc: String,
                developer: String,
                status: String
            }]
        }],
       members:[{
           memberId: {type: schema.Types.ObjectId, ref: 'user'},
           memberName: String,
           memberEmail: String
       }]
     });
    projectSchema.methods.storyStartDate = function () {
        return this.story.sprintNo *2;
    };
    return mongoose.model('Project', projectSchema);
    };
  module.exports = new projectModel();
