import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { PhylocanvasGL } from './PhylocanvasGL'
import { plugins } from "@phylocanvas/phylocanvas.gl";
import { selectHighlightedId, setHighlightedId, setSelectedIds  } from './treeSlice';


export function Tree(props: any) {
  const dispatch = useAppDispatch();
  const highlightedId = useAppSelector(selectHighlightedId)

  let treeRef = useRef<PhylocanvasGL | null>(null); // store mutable values in treeRef.current
  const mounted = useRef(false);
  
  useEffect(() => {    
    const node = treeRef.current?.findNodeById(highlightedId);
    treeRef.current?.highlightNode(node)
  }, [highlightedId])


  useEffect(() => {      
    if (!mounted.current) {
      // do componentDidMount logic
      if (props.source) {
        const canvas = document.querySelector("#tree")
        treeRef.current = new PhylocanvasGL(canvas, props, [plugins.scalebar]) // TODO setProps and render 
    
        treeRef.current.addClickHandler((info: any, event: any) => {
          // save the selectedIds in the state
          dispatch(setSelectedIds(treeRef.current?.props.selectedIds))
        }) 
    
        treeRef.current.addHoverHandler((info: any, event: any) => {
          // save the hovered node in the state
          dispatch(setHighlightedId(treeRef.current?.props.highlightedId))
        }) 
      }
      mounted.current = true;
    } else {
      // do componentDidUpdate logic
      treeRef.current?.setProps(props)
      
    }
  }, [props, dispatch]); // rerender when props change

  return (
      <div >
        <div id="tree" />
      </div>
    );
  }

