import { Table } from "flowbite-react";
import { Regression } from "../../engine/core";

interface Props {
    model: Regression | Regression[] | undefined;
}

export function ResultsTable(props: Props) {

        if (props.model === undefined) {
            return(<div></div>)
        }
        var head = [];
        var rows = [];
        if (Array.isArray(props.model)) {
            head = [
                <Table.Head key="thead">
                    <Table.HeadCell>
                        Local Clock
                    </Table.HeadCell>
                    <Table.HeadCell>
                        #Tips
                    </Table.HeadCell>
                    <Table.HeadCell>
                        <var>R<sup>2</sup></var>
                    </Table.HeadCell>
                    <Table.HeadCell>
                        Rate
                    </Table.HeadCell>
                    <Table.HeadCell>
                        Intercept
                    </Table.HeadCell>
                </Table.Head>
            ]
            for (let i=0; i<props.model.length;i++){
                rows.push(
                    <Table.Row key={`row${i}Data`}>
                        <Table.Cell >{i+1}</Table.Cell>
                        <Table.Cell >{props.model[i].x.length}</Table.Cell>
                        <Table.Cell >{props.model[i].r2.toFixed(3)}</Table.Cell>
                        <Table.Cell >{numToScientific(props.model[i].slope, 3)}</Table.Cell>
                        <Table.Cell >{(-1 * props.model[i].intercept / props.model[i].slope).toFixed(3)}</Table.Cell>
                    </Table.Row>
                )
            }
        } else {
                head = [
                <Table.Head key="thead">
                    <Table.HeadCell>
                        #Tips
                    </Table.HeadCell>
                    <Table.HeadCell>
                        <var>R<sup>2</sup></var>
                    </Table.HeadCell>
                    <Table.HeadCell>
                        Rate
                    </Table.HeadCell>
                    <Table.HeadCell>
                        Intercept
                    </Table.HeadCell>
                </Table.Head>
                ]
                rows.push(
                    <Table.Row key="trow">
                        <Table.Cell key="rowNTip">{props.model.x.length}</Table.Cell>
                        <Table.Cell key="rowR2">{props.model.r2.toFixed(3)}</Table.Cell>
                        <Table.Cell key="rowSlope">{numToScientific(props.model.slope, 3)}</Table.Cell>
                        <Table.Cell key="rowXInt">{(-1 * props.model.intercept / props.model.slope).toFixed(3)}</Table.Cell>
                    </Table.Row>
                )
        }

        return (
            <Table striped={true}>
                {head}
                <Table.Body key="tbody">
                    {rows}
                </Table.Body>
            </Table>
        )
    }

function numToScientific(num: number, dp: number) {
    let exp = num.toExponential()
    let str = exp.split('e')
    return `${parseFloat(str[0]).toFixed(dp)} x 10^${str[1]}`
}