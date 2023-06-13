import { Tooltip } from "flowbite-react";
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { setCurrentData, selectCurrentData } from '../regression/regressionSlice';
import { selectTipData, selectCurrentTree, selectSelectedIds, setSelectedIds} from '../tree/treeSlice';
import { regression } from "../engine/core";
import { readNewick } from "phylojs";
import { HiPlus } from 'react-icons/hi';


export function AddClockButton () {
    const dispatch = useAppDispatch();
    const currentTree = useAppSelector(selectCurrentTree)
    const inputTree = readNewick(currentTree)
    const tipNames = inputTree.getTipLabels()
    const tipData =  useAppSelector(selectTipData)
    const selectedIds = useAppSelector(selectSelectedIds)

    const createClock = () => {
        const tipHeights = inputTree.getRTTDist()
        let groupings: string[] = tipNames.map((name) => {
            if (selectedIds.includes(name)) {
                return "User Selected"
            } 
            return tipData[name].group
        })
        
        let decimal_dates: number[] = tipNames.map((name) => {
            return tipData[name].date
        })
        const regression_data = regression(
            tipHeights,
            decimal_dates,
            groupings,
            tipNames
        );
        
        dispatch(setCurrentData(regression_data))
        dispatch(setSelectedIds([]))
    }
    return (
        
            <div onClick={createClock} className=" rounded-full bg-blue-500 hover:bg-blue-600 cursor-pointer ml-1">
                <Tooltip content="Create clock with selection">
                    <HiPlus className="h-4 w-4 m-1 text-white" />
                </Tooltip>
            </div>
       
    )
}
