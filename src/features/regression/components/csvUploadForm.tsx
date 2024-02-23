import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { decimal_date } from '../../engine/utils';
import {useDropzone} from 'react-dropzone';
import styles from '../Regression.module.css';
import { Label, Select, Table, Tooltip } from 'flowbite-react';
import { HiX } from 'react-icons/hi';

function parseCSV(csvData: string, delimiter: string = ','): string[][] {
  let parsedCSV = csvData.trim().split('\n').map((line) => line.split(delimiter).map((cell) => cell.trim()));
  return parsedCSV
}

function sortRowsByList(parsedData: string[][], sortBy: string, orderList: string[]): string[][] {
  const headers = parsedData[0].map((header) => header.toLowerCase());
  const data = parsedData.slice(1);
  const sortByIndex = headers.indexOf(sortBy);

  if (sortByIndex === -1) {
    console.error(`Column "${sortBy}" not found.`);
    return parsedData;
  }

  const sortedData = data.sort((a, b) => {
    const aValueIndex = orderList.indexOf(a[sortByIndex]);
    const bValueIndex = orderList.indexOf(b[sortByIndex]);

    if (aValueIndex === -1) {
      return 1;
    }
    if (bValueIndex === -1) {
      return -1;
    }
    return aValueIndex - bValueIndex;
  });

  return [headers, ...sortedData];
}


function processCSVData(parsedData: string[][]): RowObject[] {
  const headers = parsedData[0];
  const data = parsedData.slice(1);

  return data.map((row) => {
    const rowObject: RowObject = {};
    row.forEach((value, index) => {
      rowObject[headers[index]] = value;
    });
    return rowObject;
  });
}


function indexDataByColumn(parsedData: string[][]): { [key: string]: string[] } {
  const headers = parsedData[0];
  const data = parsedData.slice(1);

  const indexedData: { [key: string]: string[] } = {};

  headers.forEach((header, columnIndex) => {
    indexedData[header] = [];
    data.forEach((row) => {
      indexedData[header].push(row[columnIndex]);
    });
  });

  return indexedData;
}


type RowObject = {
  [key: string]: string;
};

export function CSVInput(props: any) {
    const [csvData, setCSVData] = useState<string[][]>([]);
    const [tableData, setTableData] = useState<RowObject[]|null>(null);
    const [format, setFormat] = useState<"yyyy-mm-dd" | "decimal">("yyyy-mm-dd");
    const {acceptedFiles, getRootProps, getInputProps} = useDropzone(
        {
          multiple: false,
        }
    );
    const tipNames  = props.tipNames

    useEffect(() => {
        const reader = new FileReader()
        let delimiter = ','
        reader.onload = async (e:ProgressEvent) => { 
          const file  = (e.target as FileReader)
          const data = file.result
          if (typeof(data) === 'string') {
            const parsedData = parseCSV(data, delimiter);
            const sortedData = sortRowsByList(parsedData, 'tip', tipNames);
            const tableData = processCSVData(sortedData)
            // // TODO check that all the tips are in the csv
            setCSVData(sortedData)
            setTableData(tableData)
          }
        };
        if (acceptedFiles.length === 1) {
            console.log(acceptedFiles[0]);
            if (acceptedFiles[0].name.endsWith('.tsv')) {
              delimiter = '\t'
            }
            reader.readAsText(acceptedFiles[0])
        }
    }, [acceptedFiles, tipNames])

    const handleSubmit = () => {

      const indexedData = indexDataByColumn(csvData);
      
      let decimal_dates = indexedData.date.map( (date: string) => {
        return decimal_date(date, format)
      })
      console.log(indexedData);
      if (indexedData.group === undefined) {
        indexedData.group = Array(indexedData.date.length).fill('Background')
      }
      props.onSubmit(decimal_dates, indexedData.group)
    }

    if (tableData === null) {
        return (

          <section className="flex flex-col justify-center h-full w-full text-slate-500">
              <div className='mx-6'>
                  <div {...getRootProps({className: styles.dropzone + " h-full bg-slate-100 dark:bg-slate-700 border-zinc-500 hover:cursor-pointer hover:shadow-md"})}>
                      <div className=' flex justify-center items-center space-x-12 w-full py-2'>
                        <img className=' w-20' src='images/csv.png' alt=""/>
                          <div className=' flex flex-col items-center'>
                                  <p className='text-2xl text-center dark:text-slate-300'>Drag & drop</p>
                                  or
                                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-2">
                                      Select file
                                  </button>
                          </div>
                      </div>
                      <input {...getInputProps()} />
                    </div>
                  <div className='flex justify-center p-2'>
                      <a className='text-center text-sm text-slate-400 hover:text-slate-500' download="dates.csv" href='/MERS_dates.csv'>Headers should be tip,date,group. Click here to download an example.</a>
                  </div>
                  
              </div>
          </section>
      )
    } else {
      const headers = ['tip', 'date', 'group']
      return (
        <div>
          <div className='px-1 max-h-52 overflow-y-auto mb-6 mt-2 pb-2'>
            <Table className='!mb-2 !drop-shadow-none	'>
              <Table.Head >
                {headers.map((header, index) => (
                  <Table.HeadCell className='!px-2 !py-3' key={index}>{header}</Table.HeadCell>
                ))}
              </Table.Head>
              <Table.Body className="divide-y" >
                {tableData.slice(0, 500).map((row, rowIndex) => (
                  <Table.Row key={rowIndex} className="text-xs bg-white dark:border-gray-700 dark:bg-gray-800">
                    {headers.map((header, cellIndex) => (
                      <Table.Cell key={cellIndex} className={`${header === 'tip' ? "break-all" : "whitespace-nowrap"} !px-2 !py-2 font-medium text-gray-900 dark:text-white`}>
                        {row[header]}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))}
                { tableData.length > 500 ? 
                  <Table.Row className="text-xs bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table.Cell className="!px-2 !py-2 font-medium text-gray-900 dark:text-white">
                      ... {tableData.length - 500} rows not shown
                    </Table.Cell>
                  </Table.Row>
                :
                  <div></div>
                }
              </Table.Body>
            </Table>
          </div>
          <div className='flex justify-between items-center'>
            <div className='flex flex-grow items-center space-x-2 justify-start'>
              <div className='mr-8'>
                <Tooltip
                  content="Clear"
                  trigger="hover">
                  <button onClick={() => {setTableData(null); setCSVData([])}} className='text-slate-400 hover:text-slate-500 align-middle p-2'>
                    <HiX className="h-5 w-5" />
                  </button>
                </Tooltip>
              </div>
            </div>
            <div className='flex flex-grow items-center space-x-2 justify-end mr-4'>
              <Tooltip
                content="Use YYYY-MM-DD for YYYY-MM and YYYY"
                trigger="hover">
                <Label
                    htmlFor='format'
                    value='Date format'
                  />
              </Tooltip>
              
              <Select
                id="format"
                required={true}
                name="type"
                value={format}
                onChange={e => setFormat(e.target.value as "yyyy-mm-dd" | "decimal")}
                className="w-36"
              >
                <option value={"yyyy-mm-dd"}>
                  YYYY-MM-DD
                </option>
                <option value={"decimal"}>
                  Decimal Date
                </option>
              </Select>
            </div>
          
            <button onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-1/3">
              Parse CSV
            </button> 
          </div>

        </div>

      )
    }
   

 
}

