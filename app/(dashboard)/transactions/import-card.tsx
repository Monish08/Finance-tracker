import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ImportTable } from "./import-table";
import { convertAmountToMiliunits } from "@/lib/utils";
import {format,parse} from "date-fns";
import { on } from "events";
const dateFormat = "yyyy-MM-dd HH:mm:ss";
const outputFormat = "yyyy-MM-dd";

const requiredOptions = ["amount", "date", "payee"];
interface SelectedColumnsState {
  [key: string]: string | null;
}
type Props = {
  data: string[][];
  onCancel: () => void;
  onSubmit: (data: any) => void;
};
export function ImportCard({ data, onCancel, onSubmit }: Props) {
  const [selectedColumns, setSelectedColumns] = useState<SelectedColumnsState>(
    {},
  );
  const headers = data[0];
  const body = data.slice(1);
  const onTableHeadSelectChange = (
    columnIndex: number,
    value: string | null,
  ) => {
    setSelectedColumns((prev) => {
      const newSelectedColumns = { ...prev };
      for (const key in newSelectedColumns) {
        if (newSelectedColumns[key] === value) {
          newSelectedColumns[key] = null;
        }
      }
      if (value === "skip") {
        value = null;
      }
      newSelectedColumns[`column_${columnIndex}`] = value;
      return newSelectedColumns;
    });
  };
  const progress = Object.values(selectedColumns).filter(Boolean).length;
 const handleContinue = () => {
  const mappedData = {
    headers: headers.map((_header, index) => {
      return selectedColumns[`column_${index}`] ?? null;
    }),

    body: body
      .map((row) => {
        const transformedRow = row.map((cell, index) => {
          const selected = selectedColumns[`column_${index}`];
          return selected ? cell : null;
        });

        // remove rows that are completely skipped
        return transformedRow.every((item) => item === null)
          ? []
          : transformedRow;
      })
      .filter((row) => row.length > 0),
  };

  const arrayOfData = mappedData.body.map((row) => {
    return row.reduce((acc:any,cell,index)=>{
        const header = mappedData.headers[index]
        if(header!==null)
        {
            acc[header] = cell
        }
        return acc;
    },{})
  
})
const formattedData = arrayOfData.map((item)=>({
    ...item,
    amount:convertAmountToMiliunits(parseFloat(item.amount)),
    date:format(parse(item.date,dateFormat,new Date()),outputFormat)
}))
console.log({formattedData})
onSubmit(formattedData)
};


  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Import Transaction</CardTitle>

          <div className="flex items-center gap-x-2">
            <Button size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button size={"sm"} disabled={progress<requiredOptions.length}
            onClick={handleContinue}>
                Continue ({progress} / {requiredOptions.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ImportTable
            headers={headers}
            body={body}
            selectedColumns={selectedColumns}
            onTableHeadSelectChange={onTableHeadSelectChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
