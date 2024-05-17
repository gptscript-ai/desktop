import React, { useCallback, useContext, ChangeEvent, useEffect } from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    getKeyValue
} from "@nextui-org/react";
import { FaPlus, FaTrash } from "react-icons/fa"; // Import the FaTrash icon
import { debounce } from 'lodash';
import type { Property } from "@gptscript-ai/gptscript";
import { ToolContext } from "./tool";

const columns = [
  {
    key: "name",
    label: "Name",
  },
  {
    key: "description",
    label: "Description",
  },
  {
    key: "actions", // Add a new column for actions
    label: "Actions",
  },
];

export default function ParamsTable() {
    const { params, setParams } = useContext(ToolContext);

    const addParam = useCallback(() => {
        let newParamKey = "new-param";
        if (params && params[newParamKey]) {
            let id = 1;
            while (params[`${newParamKey}-${id}`]) id++;
            newParamKey = `${newParamKey}-${id}`;
        }

        const newParamValue: Property = {
            type: "string",
            description: "New description",
        };

        const newParams = {
            ...params,
            [newParamKey]: newParamValue,
        };
        setParams(newParams);
    }, [params]);

    const handleNameChange = useCallback(
        debounce((e: ChangeEvent<HTMLSpanElement>, key: string) => {
            let newParams = { ...params };
            if (!newParams) newParams = {};

            const oldParam = newParams[key];
            delete newParams[key];
            newParams[e.target.innerText] = oldParam;

            setParams(newParams);
        }, 1000),
        [params]
    );

    const handleDescriptionChange = useCallback(
        debounce((e: ChangeEvent<HTMLSpanElement>, key: string) => {
            let newParams = { ...params };
            if (!newParams) newParams = {};

            const oldParam = newParams[key];
            newParams[key] = { ...oldParam, description: e.target.innerText };

            setParams(newParams);
        }, 1000),
        [params]
    );

    const handleDeleteParam = useCallback((key: string) => {
        const newParams = { ...params };
        delete newParams[key];
        setParams(newParams);
    }, [params]);

    return (<>
        {params && Object.keys(params).length !== 0 && (
            <Table 
                removeWrapper
                className="overflow-x-scroll"
                aria-label="Tool parameters"
                keyboardDelegate={{}}
            >
                <TableHeader columns={columns}>
                    {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                </TableHeader>
                <TableBody>
                    {Object.entries(params).map(([key, value]) => (
                        <TableRow key={key}>
                            <TableCell>
                                <span
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => handleNameChange(e, key)}
                                >
                                    {key}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className="">
                                    <span
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => handleDescriptionChange(e, key)}
                                    >
                                        {getKeyValue(value, "description")}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Button
                                    isIconOnly
                                    radius="full"
                                    size="sm"
                                    className="ml-2"
                                    onClick={() => handleDeleteParam(key)}
                                >
                                    <FaTrash />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        )}
        <Button startContent={<FaPlus />} size="sm" variant="bordered" className="w-full mt-2" onPress={addParam}>Add parameter</Button>
    </>);
}
