import React, { useEffect } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { setSource  } from './treeSlice';
import {useDropzone} from 'react-dropzone';
import styles from './Tree.module.css';
import {exampleNewick} from './exampleNewick'

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

    const loadExample = () => {

        dispatch(setSource(exampleNewick))
    }

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
        <section className="flex flex-col justify-center h-full mx-6 text-slate-500">
            <div className=' h-1/3 ' >
                <div {...getRootProps({className: styles.dropzone + " h-full bg-slate-100 border-zinc-500 hover:cursor-pointer hover:shadow-md"})}>
                    <input {...getInputProps()} />
                    <p className='text-3xl'>Drag 'n' drop newick file here</p>
                </div>
                
                <div className='flex justify-center p-2'>
                    <button className='text-slate-400 hover:text-slate-500' onClick={loadExample}>Load example (SARS-CoV-1)</button>
                </div>
                
            </div>
        </section>
    )

 
}

