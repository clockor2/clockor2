import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { PhylocanvasGL } from './PhylocanvasGL'
import { setSelectedIds  } from './treeSlice';

export function Tree(props: any) {
  const dispatch = useAppDispatch();

  let treeRef = useRef<PhylocanvasGL | null>(null); // store mutable values in treeRef.current

  useEffect(() => {      
    // Anything in here is fired on component mount.
    const canvas = document.querySelector("#tree")
    
    treeRef.current = new PhylocanvasGL(canvas, props) // TODO setProps and render 

    treeRef.current.addClickHandler((info: any, event: any) => {
      // save the selectedIds in the state
      dispatch(setSelectedIds(treeRef.current?.props.selectedIds))
    }) 
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

