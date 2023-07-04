# Finding the best fitting root

## What is the best fitting root (BFR)
The best fitting root refers to a rooting of the input tree that maximises temporal signal. In other words, which rooting of the tree yields a dataset of root-to-tip distances and sampling times that give the best fitting regression?

Of course, this questions requires us to nominate a way of measuring the best fitting regression. Clockor2 focuses on two intuitive metrics for doing - R^2 and and the residual mean squared (RMS).

Both can be thought of measuring how closely points fit the regression line. R^2 values near 0 correspond to worse fit, while values near 1 correspond to better fit. The RMS is proportional to the sum of the vertical distances, squared, from each point to the regression line. This lower values correspond to better fit.

When finding the BFR, Clockor2 reroots the tree on each branch and optimises the point to place the root along this branch. The optomisation seems to find either the highest value of R^2, of the lowest RMS depending on the metric the user chooses to target.

Either metric may yield a more suitable result depending on the dataset, so users are given able to choose which of R^2 and RMS yields the best temporal sigal (i.e. the best fitting regression). In general, using the RMS is slightly faster. For trees up to a 1000 tips in size, finding the BFR takes seconds, and minsutes for trees on the order of 10^4^ tips.

## How-To Video