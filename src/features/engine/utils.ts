
export const decimal_date = (date: Date) => {
    var full_year = date.getFullYear();
    var year_start = new Date(full_year, 0, 1).getTime(),
        year_start_p1 = new Date(full_year + 1, 0, 1).getTime();

    const decimal_date_value =
        full_year + (date.getTime() - year_start) / (year_start_p1 - year_start);

    return decimal_date_value;
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
  function dfs(node: TreeNode, distanceFromRoot: number, leafDistances: Map<string, number>): Map<string, number> {
    if (!node.children || node.children.length === 0) {
      leafDistances.set(node.data.name, distanceFromRoot);
    } else {
      node.children.forEach((child) => {
        const distance = Number(child.data.attribute) || 0;
        dfs(child, distanceFromRoot + distance, leafDistances);
      });
    }
    return leafDistances;
  }
  
  function computeDistances(tree: any): Map<string, number> {
    const leafDistances = new Map<string, number>();
    return dfs(tree.nodes, 0, leafDistances);
  }

  export const getTipHeights = (tree: any): number[] => {
    let distances = computeDistances(tree)
    return tree.getTips().map((tip: any) => distances.get(tip.data.name)) // reorder the nodes 
  }

  export const getTipNames = (tree: any): string[] => {
    return tree.getTips().map((tip: any) => tip.data.name);
  }
