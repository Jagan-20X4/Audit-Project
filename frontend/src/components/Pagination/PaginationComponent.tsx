import { IPaginationProps } from "./Pagination.model";
import { Pagination, PaginationProps } from "antd";
import { useEffect, useState } from "react";
import {
  createSearchParams,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

const PaginationComponent = (props: IPaginationProps) => {
  const { meta } = props;
  let [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(() => {
    const skip = searchParams.get("skip");
    const take = searchParams.get("take");
    return skip && take ? Number(skip) / Number(take) + 1 : 1;
  });
  const [pageSize, setPageSize] = useState<number>(
    Number(searchParams.get("take")) || meta?.take || 10
  );
  const navigate = useNavigate();
  let location = useLocation();

  useEffect(() => {
    const skip = searchParams.get("skip");
    const take = searchParams.get("take");

    if (skip && take) {
      setCurrentPage(Number(skip) / Number(take) + 1);
      setPageSize(Number(take));
    } else {
      setCurrentPage(1);
      setPageSize(meta?.take || 10);
    }
  }, [searchParams, meta]);

  const goToPageRecord = (pageSize?: number, skip?: number) =>
    navigate({
      pathname: location.pathname,
      search: `?${createSearchParams([
        ["take", `${pageSize}`],
        ["skip", `${skip ? skip : 0}`],
      ])}`,
    });

  const searchWithPageRecord = (pageSize?: number, skip?: number) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("take", `${pageSize}`);
    sp.set("skip", `${skip ? skip : 0}`);
    setSearchParams(sp.toString());
  };

  const onChange: PaginationProps["onChange"] = (page, pageSize) => {
    const table = document.querySelector(".table-bg");
    if (table) {
      table.scrollTo(0, 0); // Scroll to top of the table
    }
    setCurrentPage(page);
    if (location.search) {
      searchWithPageRecord(pageSize, (page - 1) * pageSize);
    } else {
      goToPageRecord(pageSize, (page - 1) * pageSize);
    }
  };

  function onShowSizeChange(_current: number, pageSize: number) {
    setPageSize(pageSize);
    if (location.search) {
      searchWithPageRecord(pageSize);
    } else {
      goToPageRecord(pageSize);
    }
  }

  return (
    <Pagination
      current={currentPage}
      onChange={onChange}
      total={meta?.itemCount || 0}
      showSizeChanger
      onShowSizeChange={onShowSizeChange}
      showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
      defaultPageSize={Number(pageSize)}
      pageSize={Number(pageSize)}
      responsive={true}
    />
  );
};

export default PaginationComponent;
