
export const decimal_date = (sampDate: string, format: "yyyy-mm-dd" | "decimal") => {
  if (format === "yyyy-mm-dd"){
      let date = new Date(sampDate)
      let yr = date.getFullYear();
      let m = date.getMonth() ?? 0;
      let d = date.getDate() ?? 0;

      let decimal_date_value = (
        yr +
        m / 12 +
        d / 365.25
      )

      return decimal_date_value;
  } else  {
    let decimal_date = parseFloat(sampDate) 
    return decimal_date
  }
  };

export const date_decimal = (sampDate: number): Date => {
    var year = parseInt(sampDate.toString());
    var reminder = sampDate - year;
    var daysPerYear = 365.25
    var miliseconds = reminder * daysPerYear * 24 * 60 * 60 * 1000;
    var yearDate = new Date(year, 0, 1);
    return new Date(yearDate.getTime() + miliseconds);
};

export const createGroups = (decimal_dates:number[], tipHeights: number[], tipNames: number[], groupings:number[]) => {
    /**
     * Splits arrays into groups 
     * This method returns a array of group objects
     */
    let unique = groupings.filter((v, i, a) => a.indexOf(v) === i);
    let groups = unique.map(() => {return {tipHeights:[] as number[], decimal_dates:[] as number[], tipNames: [] as number[]}})

    for (let index = 0; index < groupings.length; index++) {
      groups[groupings[index]].decimal_dates.push(
        decimal_dates[index]
      )
      groups[groupings[index]].tipHeights.push(
        tipHeights[index]
      )
      groups[groupings[index]].tipNames.push(
        tipNames[index]
      )
    }
    return groups
  }

  interface TreeNode {
    data: {
      name: string;
      attribute?: number;
    };
    children?: TreeNode[];

  }
  function dfs(tree: any, node: TreeNode, distanceFromRoot: number, leafDistances: Map<string, number>): Map<string, number> {
    if (!node.children || node.children.length === 0) {
      leafDistances.set(node.data.name, distanceFromRoot);
    } else {
      node.children.forEach((child) => {
        const distance = Number(child.data.attribute) || 0;
        dfs(tree, child, distanceFromRoot + distance, leafDistances);
      });
    }
    return leafDistances;
  }
  
  function computeDistances(tree: any): Map<string, number> {
    const leafDistances = new Map<string, number>();
    return dfs(tree, tree.nodes, 0, leafDistances);
  }

  export const getTipHeights = (tree: any): number[] => {
    let distances = computeDistances(tree)
    return tree.getTips().map((tip: any) => distances.get(tip.data.name)) // reorder the nodes 
  }

  export const getTipNames = (tree: any): string[] => {
    return tree.getTips().map((tip: any) => tip.data.name);
  }
