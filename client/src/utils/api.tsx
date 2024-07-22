import { useEffect, useState } from "react";

interface APIProps{
    url: string;
    method: "POST" | "GET" | "PATCH" | "DELETE"
    body?: any
}

export const fetchAPI = async ({url, method, body}: APIProps) => {
    let request = new Request(url, {
        method: method}) 

    if (body) {
        request = new Request(url,  {
            method: method,
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
              },
        })
    } 
    const response = await fetch(request)
    console.log(response)
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}. Message: ${response.json()}`)
    }
    const jsonData = await response.json() 

    return jsonData
}

export const useAPI = ({url, method, body}: APIProps) => {
    const [isPending, setIsPending] = useState<boolean>(true)
    const [responseData, setResponseData] = useState<any>(null)

    // const request = new Request(url, {
    //     method: method}) 

    // if (body) {
    //     const request = new Request(url,  {
    //         method: method,
    //         body: JSON.stringify(body),
    //         headers: {
    //             "Content-Type": "application/json",
    //           },
    //     })
    // } 

    // const fetchAPI = async () => {
    //     const response = await fetch(request)
    //     if (!response.ok) {
    //         throw new Error(`Response status: ${response.status}. Message: ${response.json()}`)
    //     }
    //     const jsonData = await response.json() 
    //     setResponseData(jsonData)
    //     console.log(jsonData)
    //     setIsPending(false)
        
    // }   

    const callFetchAPI = async () => {
        const res_data = await fetchAPI({url, method, body})
        setResponseData(res_data)
        setIsPending(false)

    }

    useEffect(() => {
        callFetchAPI()
    }, [])

    return {isPending, responseData}
}