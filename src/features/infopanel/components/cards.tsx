import { Card } from "flowbite-react";

interface Props {
    text: string;
    value: number | undefined | null;
    isMin: boolean;
}

export function MetricCard(props: Props){
    return (
        <div className={props.isMin ? "border-4 border-green-400 p-6 rounded-md" : "border-4 border-gray-300 p-6 rounded-md"}>
            <div className="flex flex-row space-x-1">
                <div className="text-base text-gray-700">{ props.text }</div>
                <div className="text font-bold ">{ props.value ? props.value.toFixed(2) : "Undefined"}</div>
            </div> 
        </div>
    )
}