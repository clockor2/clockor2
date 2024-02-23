import React, { useEffect } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { setSource  } from './treeSlice';
import { useDropzone } from 'react-dropzone';
import styles from './Tree.module.css';
import { exampleNewick } from './exampleNewick'
import { setRegressionInputDefaults } from '../regression/regressionSlice';
import { ladderiseNewick } from '../engine/utils';
import { useDarkMode } from '../utils/darkmode';
import { addNotification } from '../notifications/notificationsSlice';

function validateNewickString(text: string) {
  console.log("Skipping newick validation!");
  return text
}

const LogoComponent = () => {
    const isDarkMode = useDarkMode();
    const logoSrc = isDarkMode ? '/logo-with-text-dark.png' : '/logo-with-text.png';

    return (
        <img src={logoSrc} alt="clockor2 logo" />
    );
};

export function TreeInput(props: any) {
    const dispatch = useAppDispatch();
    const {acceptedFiles, getRootProps, getInputProps} = useDropzone(
        {
        multiple: false,
        }
    );

    const loadExample = () => {
        dispatch(setSource(ladderiseNewick(exampleNewick)))
        dispatch(setRegressionInputDefaults({
            format: "yyyy-mm-dd",
            delimiter: "_",
            loc: "-1",
            group: "-2"
        }))
    }

    useEffect(() => {
        const reader = new FileReader()
        reader.onload = async (e:ProgressEvent) => { 
            const text = (e.target as FileReader).result
            if (typeof(text) === 'string') {
                try {
                    const newick = validateNewickString(text)
                    dispatch(setSource(ladderiseNewick(newick)))
                } catch (error) {
                    dispatch(addNotification({message: "Invalid newick file", type: "error"}))
                }
            }
        };
        if (acceptedFiles.length === 1) {
            reader.readAsText(acceptedFiles[0])
        }
    }, [acceptedFiles, dispatch])

    return (
        <section className="flex flex-col justify-center mx-6 pt-6 text-slate-500 dark:text-slate-400 ">
            <div className=' ' >
                <div className='flex justify-center '>
                    <div className=' max-w-xl'  >
                        <LogoComponent/>
                    </div>
                </div>
                <div className=' text-center'>
                    <p className=' font-semibold'>
                        Inferring global and local strict molecular clocks using root-to-tip regression
                    </p>

                </div>
                <div {...getRootProps({className: styles.dropzone + " bg-slate-100 dark:bg-slate-700 border-zinc-500 hover:cursor-pointer hover:shadow-md mt-6 md:mx-20"})}>
                    <div className=' flex justify-center items-center space-x-12 w-full py-6'>
                        <img className=' w-20' src='/newick.png' alt=""/>
                        <div className=' flex flex-col items-center'>
                            <p className='text-2xl text-center dark:text-slate-300'>Drag & drop</p>
                            or
                            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-2">
                                Select file
                            </button>
                        </div>
                    </div>
                    <input {...getInputProps()} />
                </div>
                
                <div className='flex justify-center p-2'>
                    <button className='hover:underline text-slate-400 hover:text-slate-500' onClick={loadExample}>Load example (MERS-CoV)</button>
                </div>
                <div className=' space-y-5 mt-5'>
                    <div>
                        <h2 className=' text-lg font-semibold dark:text-slate-300'>What is Clockor2</h2>
                        <p>
                            Clockor2 is a client-side web application for conducting root-to-tip regression - the fastest and most widely used method to calibrate strict molecular clocks. Clockor2 allows you to calibrate one or more (2+) strict molecular clocks on a single tree.
                        </p>
                    </div>
                    <div>
                        <h2 className=' text-lg font-semibold dark:text-slate-300'>How to use Clockor2</h2>
                        <p >
                            To analyze your data, drag a newick tree file onto the upload box or select the file from the file browser. At the next screen you will be prompted to enter date information for the tips in your tree. Clockor2 will perform the root-to-tip regression on you data in your browser. <span className=' font-semibold'>Your data will never leave your computer</span>. Thus Clockor2 is safe for use with sensitive data. For more details on how to use Clockor2 please refer to the <a className=' hover:underline text-slate-400 hover:text-slate-500' href='https://clockor2.github.io/docs/'>documentation</a>. 
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )

 
}

