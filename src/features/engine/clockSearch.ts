import { phylotree } from "phylotree" 
import { regression, LocalClockModel } from "./core"
import { getTipHeights, getTipNames } from "./utils"

// Clock search function. Conver to a generator later
// icMetric is the information criterion used to find 'best' state. TODO: Need to read these as part of input: aic | aicc | bic
export const clockSearch = (
    nwk: string,
    minCladeSize: number,
    maxClocks: number,
    dates: Array<number>,
    icMetric: "aic" | "aicc" | "bic"
    ) => {
  
    var tree = new phylotree(nwk)

    var allGroups: string[][][] = [];
    for (let i = 2; i < maxClocks; i++) {
        allGroups.concat(
            getGroups(
                tree,
                minCladeSize,
                i
            ))
    }

    var tipNames = getTipNames(tree);
    var tipHeights = getTipHeights(tree);
    var allGroupAsNum = allGroups.map((e: string[][]) => groupToNum(e, tipNames));
  
    var fits: LocalClockModel[] = [];
    for (let i = 0; i < allGroupAsNum.length; i++){
        fits.push(
            regression(
                tipHeights,
                dates,//TODO: is dates in the right order? - keep in state?
                allGroupAsNum[i],
                tipNames
                )
            );
    }
  
    // Now find the most supported configuration
    var ic: number[] = fits.map(
        e => e.localIC ? e.localIC[icMetric] : e.baseIC[icMetric]
        );
    var maxIC = Math.max(...ic);
    var indexBest = ic.indexOf(maxIC);
  
    return fits[indexBest];
  }
  
  export function getGroups (tree: any, minCladeSize: number, numClocks: number): string[][][] {

    var tips: any = [];
    tree.nodes.each(
        (node: any) => tips.push(
            node.leaves()
            )
        ); 

    var tipNames = tips.map(
        (leaf: any) => leaf.map(
            (e: any) => e.data.name
            )
        );

    // De-duplicate tips (artefact from d3 hierarchy)
    var uniqueTips = tipNames.map(
      (e: string[]) => JSON.stringify(e)
        ).filter(
                (e: string[], i: number, a: string[][]) => {return a.indexOf(e) === i}
                ).map(
                  (e: string) => JSON.parse(e)
                )

    var sortedUniqueTips = uniqueTips.sort(
        (a: string[], b: string[]) => {return b.length - a.length}
    );
  
    // Filter out all clades with fewer than ${minCladeSize} tips
    var finalClades = sortedUniqueTips.filter(
        (e: string[]) => e.length >= minCladeSize
        );
  
    // the set {1,...,finalClades.length} as array for combn()
    var grpNums = Array.from(Array(finalClades.length).keys());
    grpNums.shift()

    var combinations: number[][] = combn(grpNums, (numClocks - 1));
    // add 0th clade for background rate
    combinations.map(
        (e: number[]) => e.unshift(0)
        ); 
  
    // Convert number combinations to corresponding groups of tips
    let allGroups: string[][][] = [];
    for (let i = 0; i < combinations.length; i++){
      allGroups.push(
        combinations[i].map(
          (e: number) => finalClades[e]
        )
      );
    }
  
    var finalGroups = allGroups.map(e => unNestGroups(e))

    return finalGroups;
  }
  
  // De-nests group membership
  export function unNestGroups(x: string[][]): string[][] {
    return x.map((e0: string[], i) => e0.filter(
        (e1: string) => {
          if(i+1 < x.length) { 
            return !x[i+1].includes(e1); 
          } else {
            return true;
          }
        })
    );
  }
  
  // A function that takes a list of tips and returns group number based on an element of allGroups
  function groupToNum(arr: string[][], tips: string[]): number[] {
      let groupings: number[] = []; 
  
      for (let i = 0; i < tips.length; i++){
        var tmp = [];
        
        for (let j = 0; j < arr.length; j++) {
          if (arr[j].indexOf(tips[i]) > -1) {
            groupings[i] = j;
          } 
        }
      }
    return groupings;
  } // TODO: Include a test here to check that output is all integers and that ordering of tips matches input
  
  
  // generating combinations of groups
   export function combn(arr: any[], k: number): number[][] {
    // Store all possible combinations in a result array
    const result: number[][] = [];
  
    // Generate all combinations using a recursive helper function
    function generateCombinations(currentIndex: number, currentCombination: any[]): void {
      // If the current combination has the desired length, add it to the result array
      if (currentCombination.length === k) {
        result.push(currentCombination);
        return;
      }
  
      // Generate all possible combinations starting from the next element in the array
      for (let i = currentIndex; i < arr.length; i++) {
        generateCombinations(i + 1, currentCombination.concat(arr[i]));
      }
    }
  
    // Start the recursive process with the first element in the array
    generateCombinations(0, []);
  
    // Return the result array
    return result;
  }
  