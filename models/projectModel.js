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
        sprintStartDate:[String],
        sprintEndDate:[String],
        memberId :[{type: schema.Types.ObjectId, ref: 'user'}],
        memberName: [String],
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

    projectSchema.methods.storyStartDate = function () {
        return this.story.sprintNo *2;
        /*  var sprintStartDate = new Date(this.startDate);
         sprintStartDate.setDate( sprintStartDate.getDate() + this.sprintDuration * 7 * this.sprintNo);
         return sprintStartDate; */
    };

 /*   projectSchema.methods.sprintStartDate = function () {
         var msg="Start Date must be less than End Date";
        var times=this.noOfSprint();
        var strt = new Date(this.startDate);
        strt.setDate(new Date(this.startDate).getDate()+1);
        var end = new Date(this.endDate);
        while (strt < end) {
            var a=[];

            for (var i = 0; i < times; i++) {
                var strt= new Date(this.startDate);
                strt.setDate(strt.getDate()+((this.sprintDuration * 7*i)+1));
                a.push(strt);
            }
                return a;

        }
        return msg;

    };
    projectSchema.methods.sprintEndDate = function () {
        var msg="Start Date must be less than End Date";
        var strt = new Date(this.startDate);
        var end = new Date(this.endDate);
        var a=[];
        var times=this.noOfSprint();
        while (strt < end) {
            for(var i=1;i<=times;i++) {
                var strt = new Date(this.startDate);
                strt.setDate(strt.getDate() + (this.sprintDuration * 7*i));
                a.push(strt);
                    }
            return a;

        }
        return msg;
    }; */
    /* projectSchema.methods.storyEndDate = function () {

     return   (Math.floor((Math.floor((new Date(this.endDate) - new Date(this.startDate)) / (24 * 3600 * 1000 * 7))) / this.sprintDuration));

     }; */
    return mongoose.model('Project', projectSchema);

};

module.exports = new projectModel();
