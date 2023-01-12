import { Card } from "flowbite-react";

interface Props {
    text: string;
    value: number | undefined | null;
}

export function MetricCard(props: Props){
    return (
        <Card>
            <div className="text-base text-grey-900">{ props.text }</div>
            <div className="text-2xl font-bold ">{ props.value ? props.value.toFixed(2) : "NaN"}</div>
        </Card>
    )
}