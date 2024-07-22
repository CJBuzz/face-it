"use client";
import { Button, Center, Group, Loader, Space } from "@mantine/core";
import React, { useEffect, useState } from "react";

import SearchResultCard from "@/components/misc/SearchResultCard";
import { fetchAPI, useAPI } from "@/utils/api";
import { useRouter } from "next/navigation";

// const getSearchResults = async (name: string, offset: number) => {
//   console.log(name);
//   const res = await fetch("https://api.example.com/"); //Replace with actual API Call

//   if (!res.ok) throw new Error("Failed to fetch data");

//   return res.json();
// };

interface PersonInfo {
  name: string
  images: string[]
}

interface PersonInfoRawResults {
  name: string | null
  images: string[] | null
}

const batchLoadNum = 5

const page = ({ params }: { params: { results: string } }) => {
  const router = useRouter()
  const searchName = params.results.replaceAll('%2B', '+')

  const [searchResultsInfo, setSearchResultsInfo] = useState<PersonInfo[]>([])
  const [numBatchLoaded, setNumBatchLoaded] = useState<number>(0)
  const [isSubsequentLoadPending, setIsSubsequentLoadPending] = useState<boolean>(false)
  const [showLoadMore, setShowLoadMore] = useState<boolean>(false)

  const {isPending, responseData} = useAPI({url: `http://127.0.0.1:8000/FR/person?name=${searchName}&limit=${batchLoadNum}`, method: "GET"})

  useEffect(() => {
    console.log(responseData)

    if (!isPending && responseData?.length === 0) router.push('/database/not_found')
    
    if (!responseData) return
    
    setSearchResultsInfo(responseData.map((result: PersonInfoRawResults, _idx:number) => {
      return {
        name: result?.name || "",
        images: result?.images || []
      }
    }))
    setNumBatchLoaded((prev) => prev+1)
    if(responseData.length < batchLoadNum) setShowLoadMore(false)
    else setShowLoadMore(true)
  }, [isPending])
  
  const callFetchAPI = async () => {
    setIsSubsequentLoadPending(true)
    const response = await fetchAPI({url: `http://127.0.0.1:8000/FR/person?name=${searchName}&limit=${batchLoadNum}&offset=${numBatchLoaded*batchLoadNum}`, 
      method: "GET"
    })

    if (!responseData) return

    const newSearchResults = response.map((result: PersonInfoRawResults, _idx:number) => {
      return {
        name: result?.name || "",
        images: result?.images || []
      }
    })

    response && setSearchResultsInfo([...searchResultsInfo, ...newSearchResults])
    setNumBatchLoaded((prev) => prev+1)
    if(response.length < batchLoadNum) setShowLoadMore(false)

    setIsSubsequentLoadPending(false)
  }

  const handleLoadMore = () => {
    callFetchAPI()
  };

  return (
    <>
      <Group align="start" justify="center" gap="sm">
        {isPending ? 
        <Loader mt={200} type='bars' color='red' size='lg' />: searchResultsInfo.map((person, idx) => {
          return (
            <SearchResultCard
              key={`Search Results ${idx}`}
              label={person["name"]}
              image_b64={person["images"][0]}
              h={200}
              w={180}
              redirect_url={`/database/personnel/${person["name"].replaceAll(
                " ",
                "+"
              )}`}
            />
          );
        })}
      </Group>
      <Space h={20} />
      {showLoadMore && <Center>
          {isSubsequentLoadPending ? <Loader size='sm' type='bars' color='red' /> :
          <Button variant="subtle" color="red" onClick={handleLoadMore} w={150}>Load More</Button>}
      </Center>}
    </>
  );
};

export default page;
