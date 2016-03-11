/**
 * Created by Indhumathi on 2/29/2016.
 */
define(['jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {

    var StoryModel = Backbone.Model.extend({
        url: '/{projects._id}/addStory',
        defaults: {
            status: 'Backlog'
        },
        validation: {
            name: {
                required: true,
                msg: 'Please enter the storyname'
            }
        },
        initialize: function () {
            console.log("Storymodel is initialized");
        }

    });
    return StoryModel;
});
