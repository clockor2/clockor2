interface Props {
    text: string;
    value: number | undefined | null;
    isMin: boolean;
}

let cardClassName = "block max-w-sm p-3 border-2 bg-inherit rounded-lg dark:bg-gray-800 dark:hover:bg-gray-700";

export function MetricCard(props: Props){
    let style = cardClassName + (props.isMin ? " border-green-400" : " border-slate-400");
    return (
        
        <div className={style}>
            <div className="flex flex-row space-x-1">
                <div className="text-base text-gray-700 dark:text-slate-400">{ props.text }</div>
                <div className="text font-bold dark:text-slate-300">{ props.value ? props.value.toFixed(2) : "Undefined"}</div>
            </div> 
        </div>
    )
}