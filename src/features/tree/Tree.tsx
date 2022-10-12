import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { PhylocanvasGL } from './PhylocanvasGL'
import { plugins } from "@phylocanvas/phylocanvas.gl";
import { selectHighlightedId, setHighlightedId, setSelectedIds  } from './treeSlice';

export function Tree(props: any) {
  const dispatch = useAppDispatch();
  const highlightedId = useAppSelector(selectHighlightedId)

  let treeRef = useRef<PhylocanvasGL | null>(null); // store mutable values in treeRef.current

  useEffect(() => {
    console.log(highlightedId);
    
    const node = treeRef.current?.findNodeById(highlightedId);
    treeRef.current?.highlightNode(node)
  }, [highlightedId])

  useEffect(() => {      
    // Anything in here is fired on component mount.
    
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
    
    return () => {
      // Anything in here is fired on component unmount.
      treeRef.current?.destroy()
    }
  }, [props, dispatch]); // rerender when props change

  return (
      <div >
        <div id="tree" />
      </div>
    );
  }

