import { Card } from "flowbite-react";

interface Props {
    text: string;
    value: number | undefined | null;
    isMin?: boolean | undefined;
}

export function MetricCard(props: Props){
    return (
        <Card className={props.isMin ? "bg-emerald-700" : "bg-inherit"}>
            <div className="flex flex-row space-x-1">
                <div className="text-base text-grey-900">{ props.text }</div>
                <div className="text font-bold ">{ props.value ? props.value.toFixed(2) : "Undefined"}</div>
            </div> 
        </Card>
    )
}