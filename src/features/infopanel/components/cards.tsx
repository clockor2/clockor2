import { Card } from "flowbite-react";

interface Props {
    text: string;
    value: number | undefined | null;
    isMin: boolean;
}

export function MetricCard(props: Props){
    return (
        <Card className={props.isMin ? "border-2 border-blue-400" : "border-2 border-white"}>
            <div className="flex flex-row space-x-1">
                <div className="text-base text-grey-900">{ props.text }</div>
                <div className="text font-bold ">{ props.value ? props.value.toFixed(2) : "Undefined"}</div>
            </div> 
        </Card>
    )
}