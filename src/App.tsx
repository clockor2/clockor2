import React, { useEffect, useState } from 'react';
import { Tree } from './features/tree/Tree';
import { TreeInput } from './features/tree/TreeInput';
import { Regression } from './features/regression/Regression';
import { InfoPanel } from './features/infopanel/InfoPanel';
import { RegressionInput } from './features/regression/RegressionInput';
import './App.css';
import { useAppSelector } from './app/hooks';
import { selectCurrentData } from './features/regression/regressionSlice';
import { selectCurrentTree } from './features/tree/treeSlice';
import { Menu } from './features/menu/menu';
import { defaultSettings, SettingsButton, TreeSettings } from './features/tree/components/settingsButton';
import { DownloadButton } from './features/tree/components/downloadButton';
import { LocalClockModel } from './features/engine/core';
const chroma = require("chroma-js")


function createGroupsFromRegressionData(regressionData: LocalClockModel) {
  interface TipGroups {
    [key: string]: number;
  }
  let groups: TipGroups = {}
  let numberOfGroups: number
  if (regressionData.localClock) {
    numberOfGroups = regressionData.localClock.length
    for (let index = 0; index < numberOfGroups; index++) {
      regressionData.localClock[index].tip.forEach(tip => {
        groups[tip] = index
      });
    }
  } else {
    numberOfGroups = 1
    regressionData.baseClock.tip.forEach(tip => {
      groups[tip] = 0
    });
  }
  return {groups, numberOfGroups}
}

function App() {

  const [size, setSize] = useState<object | null>(null);
  const [settings, setSettings] = useState<TreeSettings>(defaultSettings)
  const currentTree = useAppSelector(selectCurrentTree);
  const regressionData = useAppSelector(selectCurrentData);
  const [nodeStyles, setNodeStyles] = useState<NodeStyles>({});
  
  interface NodeStyles {
    [key: string]: NodeStyle;
  }
  interface NodeStyle {
    [key: string]: any;
  }

  useEffect(() => {
    if (regressionData) {
      let {groups, numberOfGroups} = createGroupsFromRegressionData(regressionData)
      const colours = chroma.scale(['#fafa6e', '#2A4858']).mode('lch').colors(numberOfGroups); // move this to state
      let styles: any = {}
      
      Object.keys(groups).forEach(function(key: string, index: number) {
        styles[key] = {fillColour: colours[groups[key]], };
      });
      setNodeStyles(styles)
      console.log(styles);
    }
    
  }, [regressionData])

  useEffect(() => {
    if (!size) {
      const gridRef = document.querySelector("#main")
      let height = gridRef?.getBoundingClientRect().height
      let width = gridRef?.getBoundingClientRect().width
        setSize({height: height, width: width ? width/2 : undefined})    
    }
  }, [size])

  const onChange = (settings: TreeSettings) => {
    console.log('onchange', settings);
    
    setSettings(settings)
  }

  const downloadSVG = () => {

  }

  const downloadNewick = () => {

  }

  return (
    <div className="App h-screen overflow-hidden">
      <div className='flex flex-col justify-between h-full'>
        <Menu></Menu>
        <main id="main" className='flex h-full'>
          {currentTree === ""?
          <div className='flex flex-col items-center w-full h-full border-t-2 '>
            <div className='h-full w-full lg:w-1/3' >
              <TreeInput  />
            </div>
          </div>
          :
            <div className='w-1/2 h-full border-t-2 border-r-2'>
              <div className='relative'>
                <div className='flex absolute z-50 top-0 right-0'>
                  <DownloadButton source={currentTree} />
                  <SettingsButton saveSettings={onChange}   />
                </div>
              </div>
              <Tree 
                source={currentTree}
                selectedIds={[]}
                size={size}
                showLabels={true}
                styles={nodeStyles}
                shapeBorderAlpha={1}
                shapeBorderWidth={1}
                strokeColour={[ 34, 34, 34, 255 ]}
                showShapeBorders={true}
                padding={20}
                scalebar={{position: {bottom: 10,left: 10}}}
                {...settings}
              />
            </div>
          }
          
          {currentTree?
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
