# Getting started

## About
Welcome to the Clockor2 documentation! The Clockor2 app can be found at [clockor2.github.io](https://clockor2.github.io/). 

Clockor2 is a client-side web application for conducting root-to-tip (RTT) regression - the fastest and most widely used method to calibrate strict molecular clocks.

Clockor2 also uniquely allows users to quickly fit local molecular clocks using RTT regression, thus handling the increasing complexity of phylodynamic datasets that sample beyond the assumption homogeneous host populations. Clockor2 is efficient, handling trees of up to the order of 10<sup>4</sup> tips, with significant speed increases compared to other RTT regression applications.

We hope it is of use if you need to calibrate a molecular clock, or 2!

!!! info

    Although clockor2 is written as a web application, all data processing happens on the client-side, meaning that data never leaves the user’s computer.

## What is root-to-tip regression?
RTT regression is probably the most commonly used way to test for temporal signal (ie. a consistent rate of evolution) and detect the presence of obvious outliers (e.g. samples with incorrect collection dates) among a dataset of serially sampled genomes.

Starting with a phylogenetic tree relating the samples, the central idea is that one performs a regression between the evolutionary distance from each sample to the root against the associated sampling times. If there is temporal signal in the dataset, then we expect to see a clear relationsip between more recent sampling and increased evolutionary distance, relative to older samples. We therefore this relationship with a simple linear regression, and the R<sup>2</sup> value gives a measure of temporal signal (also referred to as "clocklike behaviour").


## Citation
If you use Clockor2 in your work, please consider citing [ADD CITATION SOON].

## Useful references

- TempEst, by [Rambaut et al. (2016)](https://academic.oup.com/ve/article/2/1/vew007/1753488?login=true) - the pioneering software for assessing temporal signal.

- Reviews on calibrating the molecular clock in temporally structured data by [Rieux and Balloux. (2016)](https://onlinelibrary.wiley.com/doi/abs/10.1111/mec.13586) and [Duchene and Duchene (2020)](https://link.springer.com/chapter/10.1007/978-3-030-60181-2_10).

