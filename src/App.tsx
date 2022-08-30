import React, { useEffect, useState } from 'react';
import { Tree } from './features/tree/Tree';
import { Regression } from './features/regression/Regression';
import './App.css';
import { Footer } from 'flowbite-react';


function App() {

  const [size, setSize] = useState<object | null>({});


  useEffect(() => {
    const gridRef = document.querySelector("#treeContainer")
    setSize({height: gridRef?.getBoundingClientRect().height, width: gridRef?.getBoundingClientRect().width})    
  }, [])

  useEffect(() => {
    console.log(size);
  })
  return (
    <div className="App h-screen overflow-hidden">
      <div className='flex flex-col justify-between h-full'>
        <main className='flex h-full'>
          <div id="treeContainer" className='h-full w-1/2 bottom-2 border'>
            <Tree 
                source="(Bovine:0.69395,(Gibbon:0.36079,(Orangutan:0.33636,(Gorilla:0.17147,(Chimp:0.19268,Human:0.11927):0.08386):0.06124):0.15057):0.54939,Mouse:1.21460);"
                showLabels
                showLeafLabels
                interactive
                selectedIds={[]}
                size={size} 
              />
          </div>
          <div className='h-full w-1/2 border-b'>
            <Regression size={size} />
          </div>
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
