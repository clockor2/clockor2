import {PhylocanvasGL as Base} from "@phylocanvas/phylocanvas.gl";

export class PhylocanvasGL extends Base {
    // this derived class allows us to monkey patch the PhylocanvasGL methods 
    constructor(view: any, props: any, plugins = []) {
      super(view , props, plugins)
      this.clickHandlers = [];
      this.view.style.backgroundImage = ''; // remove logo
    }
    handleClick(info: any, event: any) {
      super.handleClick(info, event);
      // select internal nodes
      const node = this.pickNodeFromLayer(info);
      this.selectInternalNode(
        node,
        event.srcEvent.metaKey || event.srcEvent.ctrlKey,
      )
      this.clickHandlers.forEach((fn: Function) => fn(info, event));
    }

    addClickHandler(fn: Function) {
      this.clickHandlers.push(fn);
    }

    getLeafNodeIds(node: any) {
      // depth first search 
      const ids: Array<string> = []
      var traverse = function(node: any) {
        if (!node.isLeaf) {
          for (var i = 0; i < node.children.length; i++) {
            traverse(node.children[i]);
          }
        } else {
          ids.push(node.id);
        }
      }
      traverse(node);
      return ids;
    }

    selectInternalNode(node: any, append=false) {
      console.log(node);
      
      if (node && !node.isLeaf) {
        const ids = this.getLeafNodeIds(node)
        this.selectLeafNodes(ids, append)
      }
    }
}