import {PhylocanvasGL as Base} from "@phylocanvas/phylocanvas.gl";

export class PhylocanvasGL extends Base {
    // this derived class allows us to monkey patch the PhylocanvasGL methods and add our own
    constructor(view: any, props: any, plugins:Array<any> = []) {
      super(view , props, plugins)
      this.deck.props.useDevicePixels = 2;
      this.clickHandlers = [];
      this.hoverHandlers = [];
      this.view.style.backgroundImage = ''; // remove logo

      this.addClickHandler((info: any, event: any) => {
        // select internal nodes
        const node = this.pickNodeFromLayer(info);
        this.selectInternalNode(
          node,
          event.srcEvent.metaKey || event.srcEvent.ctrlKey,
        )
      })

    }
    handleClick(info: any, event: any) {
      super.handleClick(info, event);
      this.clickHandlers.forEach((fn: Function) => fn(info, event));
    }

    handleHover(info: any, event: any) {
      super.handleHover(info, event);
      this.hoverHandlers.forEach((fn: Function) => fn(info, event));
    }

    addClickHandler(fn: Function) {
      this.clickHandlers.push(fn);
    }

    addHoverHandler(fn: Function) {
      this.hoverHandlers.push(fn);
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
      if (node && !node.isLeaf) {
        const ids = this.getLeafNodeIds(node)
        this.selectLeafNodes(ids, append)
      }
    }
}