import { Table } from "flowbite-react";
import { LocalClockModel } from "../../engine/core";
import { numToScientific } from "../../engine/utils";

interface Props {
    model: LocalClockModel| undefined;
    clock: "global" | "local";
}

export function ResultsTable(props: Props) {

        if (props.model === undefined) {
            return(<div></div>)
        }

        var head = [];
        var rows = [];
        if (props.clock === "local") {
            head = [
                <Table.Head key="thead">
                    <Table.HeadCell>
                        Clock
                    </Table.HeadCell>
                    <Table.HeadCell>
                        #Tips
                    </Table.HeadCell>
                    <Table.HeadCell>
                        Rate
                    </Table.HeadCell>
                    <Table.HeadCell>
                        <var>R<sup>2</sup></var>
                    </Table.HeadCell>
                    <Table.HeadCell>
                        Residual Mean Squared
                    </Table.HeadCell>
                    <Table.HeadCell>
                        Intercept
                    </Table.HeadCell>
                </Table.Head>
            ]
            for (let i=0; i<props.model.localClock.length; i++){
                rows.push(
                    <Table.Row key={`row${i}Data`}>
                        <Table.Cell >{props.model.groupNames[i+1]}</Table.Cell>
                        <Table.Cell >{props.model.localClock[i].x.length}</Table.Cell>
                        <Table.Cell  className=" whitespace-nowrap" >{numToScientific(props.model.localClock[i].slope, 3)}</Table.Cell>
                        <Table.Cell >{props.model.localClock[i].r2.toFixed(3)}</Table.Cell>
                        <Table.Cell  className=" whitespace-nowrap" >{numToScientific(props.model.localClock[i].rms, 3)}</Table.Cell>
                        <Table.Cell >{(-1 * props.model.localClock[i].intercept / props.model.localClock[i].slope).toFixed(3)}</Table.Cell>
                    </Table.Row>
                )
            }
        } else {
                head = [
                <Table.Head key="thead">
                    <Table.HeadCell>
                        Clock
                    </Table.HeadCell>
                    <Table.HeadCell>
                        #Tips
                    </Table.HeadCell>
                    <Table.HeadCell>
                        Rate
                    </Table.HeadCell>
                    <Table.HeadCell>
                        <var>R<sup>2</sup></var>
                    </Table.HeadCell>
                    <Table.HeadCell>
                        Residual Mean Squared
                    </Table.HeadCell>
                    <Table.HeadCell>
                        Intercept
                    </Table.HeadCell>
                </Table.Head>
                ]
                rows.push(
                    <Table.Row key="trow">
                        <Table.Cell key="name">Global</Table.Cell>
                        <Table.Cell key="rowNTip">{props.model.baseClock.x.length}</Table.Cell>
                        <Table.Cell key="rowSlope" className=" whitespace-nowrap" >{numToScientific(props.model.baseClock.slope, 3)}</Table.Cell>
                        <Table.Cell key="rowR2">{props.model.baseClock.r2.toFixed(3)}</Table.Cell>
                        <Table.Cell key="rowRMS" className=" whitespace-nowrap" >{numToScientific(props.model.baseClock.rms, 3)}</Table.Cell>
                        <Table.Cell key="rowXInt">{(-1 * props.model.baseClock.intercept / props.model.baseClock.slope).toFixed(3)}</Table.Cell>
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