'use strict';

var mongoose = require('mongoose'),
    schema = mongoose.Schema;
var user = require('../models/user');
var projectModel = function () {
    var projectSchema = schema({
        projectName: {type: String},
        projectNo: {type: String},
        startDate: String,
        endDate: String,
        sprintDuration: String,
        sprintCount: String,
        noOfSprint: String,
        sprintDetails: [{
            sprintNo: String,
            sprintStartDate: String,
            sprintEndDate: String,
            story: [{type: schema.Types.ObjectId, ref: 'project'}]
        }],
        members: [{
            memberId: {type: schema.Types.ObjectId, ref: 'user'},
            memberName: String,
            memberEmail: String
        }],
        story: [{
            name: {type: String},
            creator: String,
            date: String,
            desc: String,
            developer: String,
            status: String,
            sprintNo: String
        }],
        completedStatus: String,
        progressStatus: String
    });
       return mongoose.model('Project', projectSchema);
};
module.exports = new projectModel();
