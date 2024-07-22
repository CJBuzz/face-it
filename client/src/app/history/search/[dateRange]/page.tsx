import LoadMoreSearchHistory from "../../LoadMoreSearchHistory";

const page = ({params}: {params: {dateRange: string}}) => {
  return (
    <LoadMoreSearchHistory dateRange={params.dateRange} />);
};

export default page;