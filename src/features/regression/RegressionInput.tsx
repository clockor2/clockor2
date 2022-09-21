import React from 'react';
import { TextInput, Label } from 'flowbite-react';
import {  something } from '../engine/core';

export function RegressionInput(props: any) {
  something([], [], '')
  return (  
   <form className="flex flex-col gap-4">
      <div className=' text-xl'>Parse dates from tip labels</div>
      <div>
        <div className="mb-2 block">
          <Label
            htmlFor="format"
            value="Date format"
          />
        </div>
        <TextInput
          id="format"
          placeholder="YYYY-MM-DD"
          required={true}
        />
      </div>
      <div>
        <div className="mb-2 block">
          <Label
            htmlFor="delimiter"
            value="Delimiter"
          />
        </div>
        <TextInput
          id="delimiter"
          placeholder="e.g. _ or |"
          required={true}
        />
      </div>
      <div>
        <div className="mb-2 block">
          <Label
            htmlFor="group"
            value="Group"
          />
        </div>
        <TextInput
          id="group"
          placeholder="Group to take (0-indexed)"
          required={true}
        />
      </div>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-2">
        Parse
      </button>
    </form>
  );
}