import { Card } from "flowbite-react";

interface Props {
    text: string;
    value: number | undefined | null;
    isMin?: boolean | undefined | null;
}

export function MetricCard(props: Props){
    return (
        <Card className={props.isMin ? "bg-emerald-700" : "bg-inherit"}>
            <div className="text-base text-grey-900">{ props.text }</div>
            <div className="text-2xl font-bold ">{ props.value ? props.value.toFixed(2) : "Undefined"}</div>
        </Card>
    )
}