import React, { useEffect, useState } from 'react';
import { Tree } from './features/tree/Tree';
import { TreeInput } from './features/tree/TreeInput';
import { Regression } from './features/regression/Regression';
import { InfoPanel } from './features/infopanel/InfoPanel';
import { RegressionInput } from './features/regression/RegressionInput';
import './App.css';
import { selectSource } from './features/tree/treeSlice';
import { useAppSelector } from './app/hooks';
import { selectData } from './features/regression/regressionSlice';
import { Menu } from './features/menu/menu';


function App() {

  const [size, setSize] = useState<object | null>(null);
  const newick = useAppSelector(selectSource);
  const regressionData = useAppSelector(selectData);

  useEffect(() => {
    if (!size) {
      const gridRef = document.querySelector("#main")
      let height = gridRef?.getBoundingClientRect().height
      let width = gridRef?.getBoundingClientRect().width
        setSize({height: height, width: width ? width/2 : undefined})    
    }
  }, [size])

  useEffect(() => {
    console.log(size);
  })


  return (
    <div className="App h-screen overflow-hidden">
      <div className='flex flex-col justify-between h-full'>
        <Menu></Menu>
        <main id="main" className='flex h-full'>
          {newick === ""?
          <div className='flex flex-col items-center w-full h-full border-t-2 '>
            <div className='h-full w-full lg:w-1/3' >
              <TreeInput  />
            </div>
          </div>
          :
            <div className='w-1/2 h-full border-t-2 border-r-2'>
              <Tree 
                source={newick}
                showLabels
                showLeafLabels
                interactive
                fontSize={10}
                selectedIds={[]}
                nodeSize={7}
                size={size} 
              />
            </div>
          }
          
          {newick?
            <div className='w-full h-full border-t-2'>
              {regressionData?.baseClock ?  
                  <div className='flex flex-col justify-between h-full'>
                    <Regression size={size} />
                    <InfoPanel />
                    
                  </div>
                  :
                  <div className='flex flex-col items-center justify-center h-full'>
                    <div className="w-1/2">
                      <RegressionInput />
                    </div>
                  </div>
              }
            </div>
          :
            <div></div>
          }
        </main>   
      </div>
    </div>
  );
}

export default App;
