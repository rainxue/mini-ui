var site = require('./controllers/site');
var questions = require('./controllers/questions');
var instructional_objectives = require('./controllers/instructional_objectives');

module.exports = function(app) {
    app.all('/', site.index);

    app.get('/global/config', site.config);
    app.post('/v1.3/questions', questions.create);
    app.get('/v1.3/questions/:id', questions.get);
    app.put('/v1.3/questions/:id', questions.save);
    app.get('/v1.3/questions/:id/item', questions.getItem);
    app.put('/v1.3/questions/:id/item', questions.saveItem);

    app.get('/v1.0/instructional_objectives', instructional_objectives.list);
    
    
};
