/**
 * Created by Indhumathi on 3/2/2016.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'storyModel'
], function($, _, Backbone, Story) {

var StoryView = Backbone.View.extend({
    events: {
        'click #signUpButton': function (e) {
            e.preventDefault();
            this.signUp();
        }
    },

    initialize: function () {
        console.log("Storyview is initialized");
        Backbone.Validation.bind(this);
        _.bindAll(this, "render");
        this.model.bind('change',this.render);
    },
    render: function(){
        this.$el.html("<b><h3>Story Added</h3><b>");
        return this;
    },

    signUp: function () {
        var data = this.$el.serializeObject();
        this.model.set(data);
        if(this.model.isValid(true)){
            console.log('Great Success!'+JSON.stringify(this.model));
            this.model.save({
                url : "/{projects._id}/addStory",
            });
        }
    },
    remove: function() {
        Backbone.Validation.unbind(this);
        return Backbone.View.prototype.remove.apply(this, arguments);
    }
    return StoryView;
});


    $.fn.serializeObject = function () {
    "use strict";
    var a = {}, b = function (b, c) {
        var d = a[c.name];
        "undefined" != typeof d && d !== null ? $.isArray(d) ? d.push(c.value) : a[c.name] = [d, c.value] : a[c.name] = c.value;
    };
    return $.each(this.serializeArray(), b), a;
};

