# Performing a clock Search

## Video Demonstration 
![type:video](../videos/clockSearch.mov)

## About the clock search feature
!!! Caution
    The clock search feature is only intended as an exploratory function for local clocks. It is not a formal test for the fit of local clocks. 

The clock search feature takes a maximum number of loal clocks to search for alongside a minimum number of tips for each local clock. The clock search is slower for larger values of the maximum number of clocks and smaller values of the minimum number of tips.

In brief, the clock search starts with one global clock and iteratively adds clocks for every combination of clades that satisfy the minimum number of tips. It chooses the best configuration based on the selected information criterion. We suggest using the BIC as it penalises the addiditon of local clocks most heavily, and is hence more evolutionarily parsimonious.

See the the Examples for more detail on interpreting clock search output, especially the tutorial titled [Know the limidations](../examples/sars-cov-2.md).
