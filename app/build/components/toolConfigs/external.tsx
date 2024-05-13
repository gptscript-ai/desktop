import { useState, useEffect } from "react";
import {
    Autocomplete,
    AutocompleteItem,
} from "@nextui-org/react";;
import { debounce } from "lodash"


const External = () => {
    const [results, setResults] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    
    const search = debounce((query: string) => {
        setLoading(true);
        fetch(`https://tools.gptscript.ai/api/search?q=${query}&limit=50`)
            .then(response => response.json())
            .then((result: any) => {
                setResults(Object.keys(result.tools));
            })
            .then(() => setLoading(false))
            .catch(err => console.error(err));
    }, 500);

    useEffect(() => search("gptscript-ai"), [])

    return (<>
        <Autocomplete
            label="Tool"
            isLoading={loading}
            placeholder="Search for a tool or input a file path"
            onInputChange={(e: any) => search(e || "gptscript-ai")}
            allowsCustomValue
        >
            {results.map((result: any, key) => (
                <AutocompleteItem 
                    key={key}
                    value={result}
                    textValue={result}
                >
                    {result}
                </AutocompleteItem>
            ))}
        </Autocomplete>
    </>);
};

export default External;