// eslint-disable-next-line 
import {phylotree, rootToTip} from "phylotree"

export const something = (x: Array<number>, group: Array<number>, nwk: string) => {
    const tree = new phylotree(nwk);
    const data = [
        {
          x: x,
          y: rootToTip(tree).getTips().map((tip: any) => tip.data.rootToTip),
          mode: "markers",
        },
      ];
    return data
}
