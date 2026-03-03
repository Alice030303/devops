import { useState } from "react";


export function Search(){
    const [query, setQuery]=useState("")
    return (
        <input type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        ></input>
    )

}