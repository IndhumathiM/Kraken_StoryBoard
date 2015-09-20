'use strict';

var mongoose = require('mongoose');

var projectModel = function () {

    //Define a super simple schema for our stories.
    var projectSchema = mongoose.Schema({
        projectName: String,
        projectNo: String,
        startDate: String,
        endDate: String,
        releases:String,
        sprintDuration:String,
        sprintCount:String,
            teamname: String,
            teamno: String,
            member1: String,
            member2: String,
            member3: String,
            member4: String,
            member5: String,

        story:
            [{
        name: String,
        creator: String,
        date: String,
        desc:String,
        teamMember:String,
        sprintNo: String,
        sprintStartDate: String,
        sprintEndDate: String,
        status: String
        }]

    });

    /**
     * Verbose toString method
     */
    projectSchema.methods.whatAmI = function () {
        var greeting = this.projectname ?
        'Hello, I\'m a ' + this.projectname
            : 'I don\'t have a name :(';
        console.log(greeting);
    };
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
