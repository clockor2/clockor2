interface Props {
    text: string;
    value: number | undefined | null;
    isMin: boolean;
}

let cardClassName = "block max-w-sm p-3 border-2 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700";

export function MetricCard(props: Props){
    let style = cardClassName + (props.isMin ? " bg-green-400 bg" : "bg-inherit");
    return (
        
        <div className={style}>
            <div className="flex flex-row space-x-1">
                <div className="text-base text-gray-700">{ props.text }</div>
                <div className="text font-bold ">{ props.value ? props.value.toFixed(2) : "Undefined"}</div>
            </div> 
        </div>
    )
}