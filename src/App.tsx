import React, { useEffect, useState } from 'react';
import { Tree } from './features/tree/Tree';
import { TreeInput } from './features/tree/TreeInput';
import { Regression } from './features/regression/Regression';
import { RegressionInput } from './features/regression/RegressionInput';
import './App.css';
import { Footer } from 'flowbite-react';
import { selectSource } from './features/tree/treeSlice';
import { useAppSelector } from './app/hooks';
import { selectData } from './features/regression/regressionSlice';


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
        <main id="main" className='flex h-full'>
          {newick === ""?
          <div className='flex flex-col items-center w-full h-full bottom-2 border'>
            <div className='h-full w-full lg:w-1/3' >
              <TreeInput  />
            </div>
          </div>
          :
            <div className='w-1/2 h-full bottom-2 border'>
              <Tree 
                source={newick}
                showLabels
                showLeafLabels
                interactive
                selectedIds={[]}
                size={size} 
              />
            </div>
          }
          
          {newick?
            <div className='w-full h-full border-b'>
              {regressionData.length ?  
                  <Regression size={size} />
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
        <Footer container={true}>
          <Footer.Copyright
            href="#"
            by="Clockor2™"
            year={2022}
          />
          <Footer.LinkGroup>
            <Footer.Link href="#">
              About
            </Footer.Link>
            <Footer.Link href="#">
              Privacy Policy
            </Footer.Link>
            <Footer.Link href="#">
              Licensing
            </Footer.Link>
            <Footer.Link href="#">
              Contact
            </Footer.Link>
          </Footer.LinkGroup>
        </Footer>
      </div>
    </div>
  );
}

export default App;
