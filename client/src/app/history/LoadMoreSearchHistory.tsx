"use client"
import { Button, Center, Group, Loader, Space, Text } from "@mantine/core";
import { useEffect, useState } from "react";

import SearchResultCard from "@/components/misc/SearchResultCard";
import { DetectionResults } from "@/types/detectionTypes";
import { fetchAPI, useAPI } from "@/utils/api";
import { useRouter } from "next/navigation";

const batchLoadNum = 5

interface LoadMoreSearchHistoryProps {
  dateRange?: string 
}

const LoadMoreSearchHistory = ({dateRange}: LoadMoreSearchHistoryProps) => {
  const router = useRouter()

  const [searchResultsInfo, setSearchResultsInfo] = useState<DetectionResults[]>([])
  const [numBatchLoaded, setNumBatchLoaded] = useState<number>(0)
  const [isSubsequentLoadPending, setIsSubsequentLoadPending] = useState<boolean>(false)
  const [showLoadMore, setShowLoadMore] = useState<boolean>(false)

  const url = dateRange ? `/FR/detection?dateRange=${dateRange}&limit=${batchLoadNum}` : `/FR/detection?limit=${batchLoadNum}`

  const {isPending, responseData} = useAPI({url: `${url}`, method: "GET"})

  useEffect(() => {
    console.log(responseData)

    if (!isPending && responseData?.length === 0) router.push('/history/not_found')
    
    if (!responseData) return
    
    setSearchResultsInfo(responseData)
    setNumBatchLoaded((prev) => prev+1)
    console.log(numBatchLoaded, responseData.length)
    if(responseData.length < batchLoadNum) setShowLoadMore(false)
    else setShowLoadMore(true)
  }, [isPending])
  
  const callFetchAPI = async (numBatchLoaded: number) => {
    setIsSubsequentLoadPending(true)

    if (!responseData) return

    const response = await fetchAPI({url: `${url}&offset=${numBatchLoaded*batchLoadNum}`, 
      method: "GET"
    })

    // const newSearchResults = response.map((result: DetectionResults, _idx:number) => {
    //   return {
    //     name: result?.name || "",
    //     images: result?.images || []
    //   }
    // })

    response && setSearchResultsInfo([...searchResultsInfo, ...response])
    setNumBatchLoaded((prev) => prev+1)
    if(response.length < batchLoadNum) setShowLoadMore(false)

    setIsSubsequentLoadPending(false)
  }

  const handleLoadMore = () => {
    callFetchAPI(numBatchLoaded)
  };


  return (
    <>
      <Group align="start" justify="center" gap="sm">
        {isPending ? 
        <Loader mt={200} type='bars' color='red' size='lg' />: searchResultsInfo.map((detection, idx) => {
          return (
            <SearchResultCard
              key={`Search Results ${idx}`}
              label={(new Date(detection["date_time"])).toLocaleString('en-SG', {timeZone: 'Asia/Singapore'})}
              image_b64={detection["image_data"]}
              h={250}
              w={210}
              redirect_url={`/history/detection/${detection['id']}`}
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

export default LoadMoreSearchHistory;