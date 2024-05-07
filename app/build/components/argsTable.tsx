import React from "react";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue} from "@nextui-org/react";

import type { Property } from "@gptscript-ai/gptscript";

interface ArgsTableProps {
    args: Record<string, Property> | undefined;
}

const columns = [
  {
    key: "name",
    label: "Name",
  },
  {
    key: "description",
    label: "Description",
  },
];

export default function App({ args }: ArgsTableProps) {
    if (!args) return null;
    return (
        <Table aria-label="Example table with dynamic content" className="">
            <TableHeader columns={columns}>
                {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
            </TableHeader>
            <TableBody>
                {Object.entries(args).map(([key, value]) => (
                    <TableRow key={key}>
                        <TableCell>{key}</TableCell>
                        <TableCell>{getKeyValue(value, "description")}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
