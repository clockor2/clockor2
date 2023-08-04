import React, { useEffect, useState, createRef } from 'react';
import { Tree, TreeExportFuctions } from './features/tree/Tree';
import { TreeInput } from './features/tree/TreeInput';
import { Regression } from './features/regression/Regression';
import { InfoPanel } from './features/infopanel/InfoPanel';
import { RegressionInput } from './features/regression/RegressionInput';
import './App.css';
import { useAppSelector } from './app/hooks';
import { selectCurrentData } from './features/regression/regressionSlice';
import { selectCurrentTree, selectSelectedIds } from './features/tree/treeSlice';
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
  const selectedIds = useAppSelector(selectSelectedIds)
  const [nodeStyles, setNodeStyles] = useState<NodeStyles>({});
  const treeRef = createRef<TreeExportFuctions>();

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
      
      if (regressionData.localClock !== undefined) {
          Object.keys(groups).forEach(function(key: string, index: number) {
            styles[key] = {fillColour: colours[groups[key]], };
          });
      } else {
        Object.keys(groups).forEach(function(key: string, index: number) {
          styles[key] = {fillColour: "#000000", };
        });
      }
      setNodeStyles(styles)
    }
  }, [regressionData])

  useEffect(() => {
    function handleResize() {
      // console.log('resized to: ', window.innerWidth, 'x', window.innerHeight)
      const gridRef = document.querySelector("#main")
      let height = gridRef?.getBoundingClientRect().height
      let width = gridRef?.getBoundingClientRect().width
      const is_mobile = width ? width < 768 : false
      setSize({height: is_mobile ? 250 : height, width: width ? is_mobile ? width : width / 2  : undefined})  
    }
    if (!size) {
      handleResize() 
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [size])

  const onChange = (settings: TreeSettings) => {    
    setSettings(settings)
  }

  const renderTree = () => {
    return (
      <div id="Tree" className='w-full md:w-1/2 border-b-2 md:border-r-2 md:border-b-0'>
        <div className='relative'>
          <div className='flex absolute z-50 top-0 right-0'>
            <div className='relative flex items-end justify-between space-x-2 px-2 pt-2'>
              <DownloadButton 
                source={currentTree} 
                getNewick={() =>  {
                  return treeRef.current?.exportNewick()
                }}
                getSVG={() =>  {
                  return treeRef.current?.exportSVG()
                }}
                />
              <SettingsButton saveSettings={onChange}   />
            </div>
          </div>
        </div>
        <Tree 
          ref={treeRef}
          source={currentTree}
          selectedIds={selectedIds}
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
    )
  }

  const renderTreeInput = () => {
    return (
      <div className='flex flex-col items-center w-full h-full overflow-auto'>
        <div className='max-w-screen-lg' >
          <TreeInput  />
        </div>
      </div>
    ) 
  }

  return (
    <div className="App">
      <div className='flex flex-col md:h-screen'>
        <Menu></Menu>
        <main id="main" className='flex flex-wrap md:flex-nowrap h-full'>
          {currentTree === ""?
            renderTreeInput()
          :
            renderTree()
          }
          
          {currentTree ?
            <div className='w-full md:w-1/2'>
              {regressionData?.baseClock ?  
                  <div className='flex flex-col h-full'>
                    <Regression />
                    <InfoPanel />
                  </div>
                  :
                  <div className='flex flex-col items-center md:justify-center h-full'>
                    <div className="px-10 pt-8">
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
