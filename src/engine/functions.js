// End goal is for this file to contain all the function needed to compirse the 'engine' of the site

// libraries 
const phylotree = require("phylotree");
const fs = require("fs");
const _ = require('underscore');

// Trying to recreate regression.
// Starting with example MERS tree Presuming input of TREE and DATES.
// Grouping regressions to come later
const nwk = fs.readFileSync("egTree.nwk").toString();
const tree = new phylotree.phylotree(nwk);
// const dates = tree.getTips().map((tip) => tip.data.decimal_date_value);
// dummy dates for now
// const dates = _.range(1, tree.getTips().length+1);
const del = '_'
const group = 10
const dates = tree.getTips().map( (x) => new Date(x.data.name.split(del).pop()))
console.log(dates);

// Function to return array of heights and dates for a given tree (plotly points)
// coming once I can work how how bloody extract_dates() works.
const rttPoints = (tree, dates) => { // The issue of whether dates and tip labs will have matching orders is TBA
    let y = phylotree.rootToTip(tree).getTips().map((tip) => tip.data.rootToTip);
    let x = dates;
    let points = {};

    points['x'] = x;
    points['y'] = y;

    return points;
}

// Basic OLS Linear regression function. Returns parms of regression, fitHeight, R^2. 
// NB: predY can be y values and dates x values when plotting regression.
// Expected input is points array [ [x], [y] ]
function linearRegression(y,x){
    var lr = {};
    var n = y.length;
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var sum_yy = 0;

    for (var i = 0; i < y.length; i++) {

        sum_x += x[i];
        sum_y += y[i];
        sum_xy += (x[i]*y[i]);
        sum_xx += (x[i]*x[i]);
        sum_yy += (y[i]*y[i]);
    } 

    lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
    lr['intercept'] = (sum_y - lr.slope * sum_x)/n;
    lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);
    lr['fitHeight'] = []
    for (var i = 0; i < x.length; i++) {
        lr['fitHeight'][i] = x[i] * lr['slope'] + lr['intercept'];
    }

    return lr;
}