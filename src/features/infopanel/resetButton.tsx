import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { setCurrentData, setMode, selectBestFittingRootData } from '../regression/regressionSlice';
import { selectBestFittingRoot } from '../tree/treeSlice';
import { selectData } from '../regression/regressionSlice';
import { Label, Checkbox } from 'flowbite-react';

export function ResetDataButton() {
    const dispatch = useAppDispatch();
    const inputData = useAppSelector(selectData);
    const bfrData = useAppSelector(selectBestFittingRootData);
    const bfrTrees = useAppSelector(selectBestFittingRoot);

    const reset = () => {

        let currentBFRData = bfrTrees.using ? bfrData[bfrTrees.using] : null;

        if (inputData) {
            (currentBFRData) 
            ? 
                dispatch(setCurrentData(currentBFRData)) 
            : 
                dispatch(setCurrentData(inputData));
        }
    }
    return (

        <div className="flex items-center text-center justify-end align-top text-gray-700 hover:text-blue-700">
            <button className="px-1 text-sm font-medium rounded-md border border-gray-300 bg-slate-200 dark:text-gray-300 cursor-pointer "  onClick={reset}>
                <span>Reset</span>
            </button >
        </div>

    )
}
