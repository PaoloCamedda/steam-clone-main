"use strict";
const express = require('express');
const path = require('path');
const app = express();
const port = 4444; // porta server


app.use(express.static('./client'));

// Handle routes not found
app.get('*', (req, res) => {
 res.sendFile(path.resolve(__dirname, 'client/index.html'));
});

// Listen server
app.listen(port, () => {
 console.log(`server up on ${port}`);
});