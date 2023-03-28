import { Dropdown, Checkbox, Label, Modal, Select } from "flowbite-react";
import React, { useState } from "react";


type Props = {
    source: string;
};

function DropdownMenu(props: any) {    
    if (props.show) {
        return (
            <div id="dropdown" className=" absolute z-50 top-14 right-0 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600">
                <ul className="flex flex-col items-center text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownMenuIconButton">
                    <li className=" w-full">
                        <button className=" px-4 py-2 w-full hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">SVG</button>
                    </li>
                    <li className=" w-full">
                        <button className=" px-4 py-2 w-full hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Newick</button>
                    </li>
                </ul>
            </div>
    )}
    else {
        return <div></div>
        }
}

export function DownloadButton({
    source
}: Props){
  const [isToggled,setToggle] = useState(false);
    const toggleModal = () => {
      setToggle(!isToggled)
    }
    const download = () => {
        const url = window.URL.createObjectURL(
            new Blob([source]),
          );
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
        'download',
        `clockor2.nwk`,
        );
    
        // Append to html link element page
        document.body.appendChild(link);
    
        // Start download
        link.click();
    
        // Clean up and remove the link
        link.parentNode?.removeChild(link);
    }

    return (
      <div className=" relative">
        <button onClick={download} className=' text-slate-600 hover:text-blue-300 p-1 my-3 mx-1 rounded-md border border-transparent hover:border-blue-200'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
        </button>
        {/* <DropdownMenu className=" relative" show={isToggled}></DropdownMenu> */}
      </div>
        
    )
}