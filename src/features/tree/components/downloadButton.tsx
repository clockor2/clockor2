import { Dropdown, Checkbox, Label, Modal, Select } from "flowbite-react";
import React, { useState } from "react";


type Props = {
    source: string;
    getNewick: CallableFunction | undefined
    getSVG: CallableFunction | undefined
};

function DropdownMenu(props: any) {    
    if (props.show) {
        return (
            <div id="dropdown" className=" absolute z-50 top-8 right-0 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600">
                <ul className="flex flex-col items-center text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownMenuIconButton">
                    <li className=" w-full">
                        <button onClick={props.svg} className=" px-4 py-2 w-full hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">SVG</button>
                    </li>
                    <li className=" w-full">
                        <button onClick={props.newick} className=" px-4 py-2 w-full hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Newick</button>
                    </li>
                </ul>
            </div>
    )}
    else {
        return <div></div>
        }
}

export function DownloadButton({
    source,
    getNewick,
    getSVG
}: Props){
  const [isToggled,setToggle] = useState(false);
    const toggleModal = () => {
      setToggle(!isToggled)
    }
    const download = (blob: Blob, filename: string) => {
        const url = window.URL.createObjectURL(
            new Blob([blob]),
          );
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
        'download',
        filename,
        );
    
        // Append to html link element page
        document.body.appendChild(link);
    
        // Start download
        link.click();
    
        // Clean up and remove the link
        link.parentNode?.removeChild(link);
    }
    const downloadNewick = () => {
        if (getNewick) {
            let newick: Blob = getNewick()
            download(newick, 'clockor2.newick')
        }
        toggleModal()
    }
    const downloadSVG = () => {
        if (getSVG) {
            let svg: Blob = getSVG()
            download(svg, 'clockor2.svg')
        }
        toggleModal()
    }

    return (
      <div className=" relative">
        <button onClick={toggleModal} className=' text-slate-400 hover:text-slate-500'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
        </button>
        <DropdownMenu className=" relative" show={isToggled} newick={downloadNewick} svg={downloadSVG}></DropdownMenu>
      </div>
        
    )
}