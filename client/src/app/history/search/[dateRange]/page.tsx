import LoadMoreSearchHistory from "../../LoadMoreSearchHistory";

const Page = ({params}: {params: {dateRange: string}}) => {
  return (
    <LoadMoreSearchHistory dateRange={params.dateRange} />);
};

export default Page;