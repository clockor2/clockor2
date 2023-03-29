import { Card } from "flowbite-react";

interface Props {
    text: string;
    value: number | undefined | null;
    isMin: boolean;
}

export function MetricCard(props: Props){
    console.log("MC" + props.isMin)
    return (
        <Card className={props.isMin ? "bg-green-200" : "bg-white-200"}>
            <div className="flex flex-row space-x-1">
                <div className="text-base text-grey-900">{ props.text }</div>
                <div className="text font-bold ">{ props.value ? props.value.toFixed(2) : "Undefined"}</div>
            </div> 
        </Card>
    )
}