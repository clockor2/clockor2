import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { setCurrentData, selectUsingBFR, setMode, selectBestFitData } from '../regression/regressionSlice';
import { selectData } from '../regression/regressionSlice';
import { Label, Checkbox } from 'flowbite-react';

export function ResetDataButton() {
    const dispatch = useAppDispatch();
    const inputData = useAppSelector(selectData);
    const usingBFR = useAppSelector(selectUsingBFR);
    const bfrData = useAppSelector(selectBestFitData);

    const reset = () => {
        if (inputData) {
            usingBFR && bfrData ? dispatch(setCurrentData(bfrData)) : dispatch(setCurrentData(inputData));
            dispatch(setMode(null))
        }
    }
    return (

        <div className="flex items-center">
            <Label className="text-sm font-medium !text-gray-700 dark:text-gray-300 pr-1 cursor-pointer" htmlFor="bestRoot">
                Reset
            </Label >
            <Checkbox className="cursor-pointer" id="resetData" onClick={reset} defaultChecked={false} />
        </div>

    )
}
