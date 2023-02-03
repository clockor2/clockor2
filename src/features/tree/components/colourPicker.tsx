import { Button, Checkbox, Label, Modal } from "flowbite-react";
import React, { useState } from "react";

export interface TreeSettings {
  showLeafLabels: boolean,
  interactive: boolean,
  fontSize: number,
  nodeSize: number
}

export const defaultSettings = {
  showLeafLabels: false,
  interactive: true,
  fontSize: 10,
  nodeSize:7
}

type Props = {
  onChange: (newColor: TreeSettings) => void;
};

export function SettingsButton({
    onChange
}: Props){
  
    return (
      <div>
        
      </div>
        
    )
}