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
        memberId :[{type: schema.Types.ObjectId, ref: 'user'}],
        story:            [{
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

    projectSchema.methods.noOfSprint = function () {



        return   (Math.floor((Math.floor((new Date(this.endDate) - new Date(this.startDate)) / (24 * 3600 * 1000 * 7))) / this.sprintDuration));

    };
    projectSchema.methods.storyStartDate = function () {

        return this.story.sprintNo *2;


        /*  var sprintStartDate = new Date(this.startDate);
         sprintStartDate.setDate( sprintStartDate.getDate() + this.sprintDuration * 7 * this.sprintNo);
         return sprintStartDate; */

    };
    /* projectSchema.methods.storyEndDate = function () {

     return   (Math.floor((Math.floor((new Date(this.endDate) - new Date(this.startDate)) / (24 * 3600 * 1000 * 7))) / this.sprintDuration));

     }; */
    return mongoose.model('Project', projectSchema);

};

module.exports = new projectModel();
