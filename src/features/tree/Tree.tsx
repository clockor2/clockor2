import React, { useEffect, useRef } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { PhylocanvasGL } from './PhylocanvasGL'
import { setSelectedIds, setSource  } from './treeSlice';
import {useDropzone} from 'react-dropzone';
import styles from './Tree.module.css';

function validateNewickString(text: string) {
  console.log("Skipping newick validation");
  return text
}

export function Tree(props: any) {
  const dispatch = useAppDispatch();
  const {acceptedFiles, getRootProps, getInputProps} = useDropzone(
    {
      multiple: false,
    }
  );

  let treeRef = useRef<PhylocanvasGL | null>(null); // store mutable values in treeRef.current

  useEffect(() => {
    const reader = new FileReader()
    reader.onload = async (e:ProgressEvent) => { 
      const text = (e.target as FileReader).result
      if (typeof(text) === 'string') {
        const newick = validateNewickString(text)
        dispatch(setSource(newick))
      }
    };
    if (acceptedFiles.length === 1) {
      reader.readAsText(acceptedFiles[0])
    }
  }, [acceptedFiles, dispatch])

  useEffect(() => {      
    // Anything in here is fired on component mount.
    
    if (props.source) {
      const canvas = document.querySelector("#tree")
      treeRef.current = new PhylocanvasGL(canvas, props) // TODO setProps and render 

      treeRef.current.addClickHandler((info: any, event: any) => {
        // save the selectedIds in the state
        dispatch(setSelectedIds(treeRef.current?.props.selectedIds))
      }) 
    }
    
    return () => {
      // Anything in here is fired on component unmount.
      treeRef.current?.destroy()
    }
  }, [props, dispatch]); // rerender when props change

  if (props.source) {
    return (
      <div >
        <div id="tree" />
      </div>
    );
  } else {
    return (
      <section className="flex items-center h-full mx-6">
        <div {...getRootProps({className: styles.dropzone})}>
          <input {...getInputProps()} />
          <p>Drag 'n' drop newick file here</p>
        </div>
      </section>
    )
  }

 
}

