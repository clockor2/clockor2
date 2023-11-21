import { Checkbox, Label, Modal, Select } from "flowbite-react";
import React, { useState } from "react";

export interface TreeSettings {
  showLeafLabels: boolean,
  interactive: boolean,
  fontSize: number,
  nodeSize: number,
  type: string
}

export const defaultSettings = {
  showLeafLabels: false,
  interactive: true,
  fontSize: 10,
  nodeSize: 6,
  type: 'rc'
}

type Props = {
  saveSettings: (newSettings: TreeSettings) => void;
};

export function SettingsButton({
  saveSettings
}: Props){
    const [openModal, setOpenModal] = useState<string | undefined>();
    const [settings, setSettings] = useState<TreeSettings>(defaultSettings)
    
    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      let newSettings
      if(event.target.type === 'checkbox') {
        newSettings = { ...settings, [event.target.name]: (event.target as HTMLInputElement).checked }
      } else if (event.target.type === 'range') {
        newSettings = { ...settings, [event.target.name]:  Number(event.target.value) }
      } else {
        newSettings = { ...settings, [event.target.name]:  event.target.value }
      }
      setSettings(newSettings);
      saveSettings(newSettings)
    };

    return (
      <div>
        <button onClick={() => setOpenModal('default')} className=' text-slate-400 hover:text-slate-500'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
        </button>
        <React.Fragment>
          <Modal
            dismissible={true}
            show={openModal === 'default'}
            onClose={() => setOpenModal(undefined)}

          >
            <Modal.Header>
              Tree Display Settings
            </Modal.Header>
            <Modal.Body>
            <form className="flex flex-col gap-4" >
              <div className="flex items-center gap-2">
                <Checkbox defaultChecked={settings.showLeafLabels} onChange={handleChange} name="showLeafLabels" id="showLeafLabels" />
                <Label htmlFor="showLeafLabels">
                  Show Leaf Labels
                </Label>
                
              </div>
              { !settings.showLeafLabels ?
              <div></div>
              :
              <div>
                <label htmlFor="fontSize" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Label font size</label>
                <div className="flex items-center">
                  <div className="w-12 text-gray-900 dark:text-white">{settings.fontSize}px</div>
                  <input id="fontSize" type="range" min={1} max={20} value={settings.fontSize} name="fontSize" onChange={handleChange} className="w-1/2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
                </div>
              </div>
              }
              <div>
                <label htmlFor="nodeSize" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Node size</label>
                <div className="flex items-center">
                  <div className="w-12 text-gray-900 dark:text-white">{settings.nodeSize}px</div>
                  <input id="nodeSize" type="range" min={1} max={20} value={settings.nodeSize} name="nodeSize" onChange={handleChange} className="w-1/2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
                </div>
              </div>
              <div id="select">
                <div className="mb-2 block">
                  <Label
                    htmlFor="treeType"
                    value="Select tree type"
                  />
                </div>
                <Select
                  id="treeType"
                  required={true}
                  name="type"
                  value={settings.type}
                  onChange={handleChange}

                >
                  <option value={"rc"}>
                    Rectangular
                  </option>
                  <option value={"rd"}>
                    Radial
                  </option>
                  <option value={"cr"}>
                    Circular
                  </option>
                  <option value={"dg"}>
                    Diagonal
                  </option>
                  <option value={"hr"}>
                    Hierarchical
                  </option>
                </Select>
              </div>
            </form>
            </Modal.Body>
          </Modal>
        </React.Fragment>
      </div>
        
    )
}