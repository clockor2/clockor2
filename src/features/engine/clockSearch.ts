import { phylotree } from "phylotree" 
import { regression, LocalClockModel } from "./core"
import { getTipHeights, getTipNames } from "./utils"

/**
 * Creates a web worker for clock search in background thread
 *
 * @param {string} nwk - The Newick string representing the phylogenetic tree.
 * @param {number} minCladeSize - Minimum group size for search
 * @param {number} maxClocks - Max clocks to search for. Searches for 1..maxClocks
 * @param {number[]} dates - Tip dates
 * @param {"aic" | "aicc" | "bic"} icMetric - Information criterion used to determine best config. BIC reccommened.
 * @returns {Promise} - A Promise that resolves with the worker's response data.
 */
export function createClockSearchWorker(
  nwk: string, 
  minCladeSize: number,
  maxClocks: number,
  dates: number[], 
  icMetric: "aic" | "aicc" | "bic"
  ): Promise<LocalClockModel> {
  return new Promise(function (resolve, reject) {
    const worker = new Worker(new URL("./clockSearchWorker.ts", import.meta.url));
    worker.postMessage({
      nwk: nwk, 
      minCladeSize: minCladeSize,
      maxClocks: maxClocks,
      dates: dates, 
      icMetric: icMetric
    });
    worker.onmessage = (e) => {
      resolve(e.data);
    };
    worker.onerror = reject;
  });
}

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
    for (let i = 1; i <= maxClocks; i++) {
        allGroups = allGroups.concat(
            getGroups(
                tree,
                minCladeSize,
                i
            ))
    }
    // converting to group string
    var allTips = tree.getTips().map((e: any) => e.data.name)

    // error for too many clocks
    const error = Error(`Too may clocks for minimum clade size. Spurious results await`)
    if (maxClocks > Math.floor(allTips.length / minCladeSize) ){
      console.error(error.message)
    } 


    var groupsNumbered = allGroups.map(
      (e:string[][]) => makeGroups(
        allTips, 
        e)
    )

    var tipNames = getTipNames(tree);
    var tipHeights = getTipHeights(tree);
    
    var fits: LocalClockModel[] = [];
    for (let i = 0; i < allGroups.length; i++){
        fits.push(
            regression(
                tipHeights,
                dates,//TODO: is dates in the right order? - keep in state?
                groupsNumbered[i],
                tipNames
                )
            );     
    }

    // Now find the most supported configuration. Want baseIC iff only one group
    var ic: number[] = fits.map(
        e => e.localClock.length > 1 ? e.localIC[icMetric] : e.baseIC[icMetric]
        );

    var minIC = Math.min(...ic); 

    var indexBest = ic.indexOf(minIC);
    return fits[indexBest];
  }
  
  export function getGroups (tree: any, minGroupSize: number, numClocks: number): string[][][] {
    var tipNodes = tree.getInternals().map((e: any) => e.leaves())

    // TODO: Throw error if numClocks > nTips / minGroupSize. Needs Parse Int

    var tips = tipNodes.map(
      (e: any) => e.map((e1: any) => e1.data.name)
      ).sort(
        (a: string[], b: string[]) => {return b.length - a.length}
      ).filter(
        (e: string[]) => e.length >= minGroupSize
      );
  
    // [1,...,tips.length] as array for combn()
    let nums = [...Array(tips.length)].map((e, i) => i).slice(1);

    var combinations: number[][] = combn(nums, (numClocks - 1));
    
    // return 0th clade for background rate, sort, and find unique
    combinations.map(
        (e: number[]) => e.unshift(0)
        )

    // Convert number combinations to corresponding groups of tips
    var allGroups: string[][][] = [];
    var tmp: string[][] = []
    for (let i = 0; i < combinations.length; i++){
      tmp = combinations[i].map(
        (e: number) => tips[e]
      )
      allGroups.push(tmp);
    }

    allGroups = allGroups.map(e => unNest(e))
    // allGroups = allGroups.map(e => e.sort()) // sorting for testing
    
    // Filter out all groups with fewer than ${minCladeSize} tips
    var finalGroups = allGroups.filter(
      (e0: string[][]) => !(
        e0.some(
          (e1: string[]) => e1.length < minGroupSize
        )
      ) 
    );

    // de-duplicating
    finalGroups = finalGroups.map(
      e => JSON.stringify(e)
    ).filter(
      (v,i,a)=>a.indexOf(v)===i
    ).map(
      e => JSON.parse(e)
    )

    return finalGroups;

  }

// Make groups into a 1D array of numbers coresponding to tips. TODO: test
export function makeGroups(tips: string[], nestedGrp: string[][]): number[] {
 let grp: number[] = []

 for (let i=0; i<tips.length; i++){
  for (let j=nestedGrp.length-1; j>=0; j--){

    if (nestedGrp[j].includes(tips[i])){
      grp.push(j)
      break
    } 
  
  }
 }

 return grp;
}

  
  // Un-nests group membership
  export function unNest(arr: string[][]): string[][] {
    var unNested: string[][] = [];

    unNested[arr.length-1] = arr[arr.length-1];
    for (let i = arr.length-2; i>=0; i--){
      unNested[i] = arr[i].filter(
        (e: string) => !arr.slice(i+1).flat().includes(e)
      )
    }
    return unNested.sort();
  }
  
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
  