"use client"

import {useState, useEffect, useContext, useCallback} from "react";
import {ParsedScript} from "@/actions/me/scripts";
import {getScripts, deleteScript} from "@/actions/me/scripts";
import {Input} from "@nextui-org/input";
import {AuthContext} from "@/contexts/auth";
import {Card, CardHeader, CardBody, Select, SelectItem, Chip, Divider, Avatar, Tooltip, Button} from "@nextui-org/react";
import Loading from "@/components/loading";
import {GoSearch} from "react-icons/go";
import ScriptModal from "@/components/explore/scriptModal";
import { debounce } from "lodash";
import { MdOutlineTravelExplore } from "react-icons/md";
import { NavContext } from "@/contexts/nav";

export default function Explore() {
    const [scripts, setScripts] = useState<ParsedScript[]>([]);
    const [filteredScripts, setFilteredScripts] = useState<ParsedScript[]>([]);
    const [loading, setLoading] = useState(true);
    const { authenticated } = useContext(AuthContext);
    const {setCurrent} = useContext(NavContext)
    const [owners, setOwners] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [open, setOpen] = useState(false);
    const [selectedScript, setSelectedScript] = useState<ParsedScript>({} as ParsedScript);
    const [next, setNext] = useState<string | undefined>("");
    const [nextLoading, setNextLoading] = useState(false);
    
    // filters
    const [query, setQuery] = useState<string>('');
    const [filteredOwners, setFilteredOwners] = useState<Set<string>>(new Set([]));
    const [filteredVisibility, setFilteredVisibility] = useState<Set<string>>(new Set([]));
    const [filteredTags, setFilteredTags] = useState<Set<string>>(new Set([]));

    const refresh = useCallback(() => {
        getScripts({limit: 10, search: query})
            .then((resp) => {
                setNext(resp.continue)
                setScripts(resp.scripts || []) 
                setFilteredScripts(resp.scripts || [])
            })
            .catch((error) => console.error(error))
            .finally(() => setLoading(false));
    }, []);

    // this currently doesn't update whenever the filtered scripts is updated to avoid an rerender loop
    useEffect(() => {
        // make assumption that all scripts will have an owner
        setOwners(Array.from(new Set(filteredScripts.map((script) => script.owner!))));
        // horrible code, needs adjustment
        setTags(Array.from(new Set(filteredScripts.map((script) => script.tags).flat())).filter((tag) => tag != undefined) as string[]);
    }, [scripts]);

    useEffect(() => {
        if (!query && !filteredOwners.size && !filteredVisibility.size && !filteredTags) {
            setFilteredScripts(scripts);
            return;
        }

        let newFilteredScripts = scripts;
        if (filteredOwners.size) {
            newFilteredScripts = newFilteredScripts.filter((script) => filteredOwners.has(script.owner!));
        }
        if (filteredVisibility.size) {
            newFilteredScripts = newFilteredScripts.filter((script) => filteredVisibility.has(script.visibility!));
        }
        if (filteredTags.size) {
            newFilteredScripts = newFilteredScripts.filter((script) => script.tags?.some((tag) => filteredTags.has(tag)));
        }
        if (query) {
            newFilteredScripts = newFilteredScripts.filter((script) => script.displayName?.toLowerCase()?.includes(query.toLowerCase()) || script.content?.toLowerCase().includes(query.toLowerCase()));
        }
        
        setFilteredScripts(newFilteredScripts);
    }, [query, filteredOwners, filteredVisibility, filteredTags]);

    useEffect(() => { 
        setCurrent('/explore')
        refresh() 
    }, []);
    useEffect(() => { refresh() }, [authenticated]);;

    return (
        <div className="w-full px-20 h-full overflow-y-scroll mx-auto pt-10">
            <div className="flex w-full justify-between space-x-2 mt-10 mb-20">
                <h1 className="text-4xl font-bold text-primary-400">
                <MdOutlineTravelExplore className="inline mb-2 mr-1 text-5xl"/> Explore
                </h1>
                <div className="w-3/4 flex justify-end space-x-4">
                    <Select radius="lg" label="Owners" color="primary" isDisabled={!owners.length} size="sm" aria-label="owners" selectionMode="multiple" className="w-1/6" variant="bordered" classNames={{label: 'text-gray-500 dark:text-gray-400', value:'text-black dark:text-white'}}
                        onSelectionChange={(keys) => { setFilteredOwners(keys as Set<string>)}}
                    >
                        {owners.map((owner) => <SelectItem key={owner} value={owner}>{owner}</SelectItem>)}
                    </Select>
                    <Select radius="lg" label="Visibility" color="primary" size="sm" aria-label="visibility" selectionMode="multiple" className="w-1/6" variant="bordered" classNames={{label: 'text-gray-500 dark:text-gray-400', value:'text-black dark:text-white'}}
                        onSelectionChange={(keys) => { setFilteredVisibility(keys as Set<string>)}}
                    >
                        <SelectItem key="public" value="public">Public</SelectItem>
                        <SelectItem key="private" value="private">Private</SelectItem>
                        <SelectItem key="protected" value="private">Protected</SelectItem>
                    </Select>
                    <Select radius="lg" label="Tags" color="primary" isDisabled={!tags.length} size="sm" aria-label="tags" selectionMode="multiple" className="w-1/6" variant="bordered" classNames={{label: 'text-gray-500 dark:text-gray-400', value:'text-black dark:text-white'}}
                        onSelectionChange={(keys) => { setFilteredTags(keys as Set<string>)}}
                    >
                        {tags.map((tag) => <SelectItem key={tag} value={tag}>{tag}</SelectItem>)}
                    </Select>
                    <Input 
                        startContent={<GoSearch />}
                        placeholder="Search for an agent..."
                        color="primary"
                        variant="bordered"
                        isClearable
                        size="lg"
                        className="w-1/5"
                        onChange={(e) => {
                            setQuery(e.target.value)
                            if (e.target.value === '') refresh()
                        }}
                        onKeyDown={debounce((e) => {
                            if (e.key === 'Enter') {
                                refresh()
                            }
                        })}
                    />
                </div>
            </div>
            {loading ?
                <Loading /> :
                <div className={'pb-10'}>
                    <ScriptModal script={selectedScript} open={open} setOpen={setOpen} />
                    <div className="grid gap-12 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
                        {filteredScripts.map((script) => (
                            <div
                                key={script.displayName}
                                onClick={() => {
                                    setSelectedScript(script)
                                    setOpen(true)
                                }}
                            >
                                <Card 
                                    className="h-[350px] border-2 border-white dark:bg-zinc-900 p-6 dark:border-zinc-900 hover:border-primary hover:shadow-2xl dark:hover:border-primary cursor-pointer transition duration-300 ease-in-out transform hover:scale-105" 
                                    key={script.displayName}
                                    shadow="md"
                                >
                                    <CardHeader className="block">
                                        <div className="w-full">
                                            <h1 className="text-2xl font-medium truncate">{script.agentName ? script.agentName : script.displayName}</h1>
                                            <p className="block truncate"><span className="text-primary text-sm">{script.owner}</span></p>
                                        </div>
                                        <div className="flex space-x-1 w-[90%] overflow-x-auto mt-4">
                                            {tags.map((tag) => script.tags?.includes(tag) ? 
                                                <Chip size="sm" className="pb-0 mb-0" color="primary" key={tag}>{tag}</Chip> : null
                                            )}
                                        </div>
                                        <Divider className="mt-4"/>
                                    </CardHeader>
                                    <CardBody>
                                        <p className="text-wrap text-sm text-zinc-500">{script.description ? script.description : "No description provided"}</p>
                                    </CardBody>
                                </Card>
                            </div>
                        ))}
                        {next && 
                            <Button
                                isLoading={nextLoading}
                                color="primary" 
                                size="lg" 
                                className="col-span-1 md:col-span-2 xl:col-span-3 3xl:col-span-4"
                                onPress={() => {
                                    setNextLoading(true)
                                    getScripts({limit: 10, continue: next})
                                        .then((resp) => {
                                            if (resp.continue) setNext(resp.continue)
                                            else setNext(undefined)
                                            setScripts([...scripts, ...resp.scripts || []])
                                            setFilteredScripts([...filteredScripts, ...resp.scripts || []])
                                        })
                                        .catch((error) => console.error(error))
                                        .finally(() => setNextLoading(false));
                                }}
                            >
                                Load More
                            </Button>
                        }
                    </div>
                </div>
            }
        </div>
    )
}
