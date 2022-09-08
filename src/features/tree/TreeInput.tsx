import React, { useEffect } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { setSource  } from './treeSlice';
import {useDropzone} from 'react-dropzone';
import styles from './Tree.module.css';

function validateNewickString(text: string) {
  console.log("Skipping newick validation!");
  return text
}

export function TreeInput(props: any) {
    const dispatch = useAppDispatch();
    const {acceptedFiles, getRootProps, getInputProps} = useDropzone(
        {
        multiple: false,
        }
    );

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

    return (
        <section className="flex items-center h-full mx-6">
        <div {...getRootProps({className: styles.dropzone})}>
            <input {...getInputProps()} />
            <p>Drag 'n' drop newick file here</p>
        </div>
        </section>
    )

 
}

