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

        <div className="flex items-center text-center justify-end align-top text-gray-700 hover:text-blue-700">
            <button className="px-1 text-sm font-medium rounded-md border border-gray-300 bg-slate-200 dark:text-gray-300 cursor-pointer "  onClick={reset}>
                <span>Reset</span>
            </button >
        </div>

    )
}
