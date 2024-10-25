"use strict";

const { app, port } = require ('./init');
const {check, validationResult} = require('express-validator'); // validation middleware
var {routerProtected: gamesRouterProtected, routerUnprotected: gamesRouterUnprotected} = require('./routes/games');
var  {routerProtected: usersRouterProtected, routerUnprotected: usersRouterUnprotected} = require('./routes/users');
var categoriesRouter = require('./routes/categories');
var sessionsRouter = require('./routes/sessions');
const searchRouter = require('./routes/search');
const autocompleteRouter = require('./routes/autocomplete');
const path = require('path');
/*
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
*/

/*
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
*/

// check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
 if(req.isAuthenticated()){
  return next();
 }
 return res.status(401).json({status: 401, message : "not authenticated"});
}

app.use('/games', gamesRouterUnprotected);
app.use('/games', isLoggedIn, gamesRouterProtected);

app.use('/users', usersRouterUnprotected);
app.use('/users', isLoggedIn, usersRouterProtected);

app.use('/categories', categoriesRouter);
app.use('/sessions', sessionsRouter);

app.use('/search', searchRouter);
app.use('/autocomplete', autocompleteRouter);

app.get('*', (req, res) => {
 res.sendFile(path.resolve(__dirname, 'client/index.html'));
})

app.listen(port, () => {
 console.log(`Server listening on port ${port}`)
})
