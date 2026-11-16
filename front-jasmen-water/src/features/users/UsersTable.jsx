import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUsers } from "./useUsers";

import Spinner from "../../ui/spinner/Spinner";
import Table from "../../ui/Table";
import UserRow from "./UserRow";
import Pagination from "../../ui/Pagination";
import Empty from "../../ui/Empty";
import { useUser } from "./useUser";

function UsersTable() {
  const [t] = useTranslation();

  // get the value from the URL
  const [searchParams] = useSearchParams();

  // Fetch Cabins Hook
  const { isLoading, users, totalPages, count, error } = useUsers();

  if (isLoading) return <Spinner height="h-[calc(100vh-160px)]" />;
  if (!users?.length) return <Empty message={t("users.noUsers")} />;
  if (error) return <Empty message={t("general.failedToGetData")} />;

  // Filtering  The Value From The URL (Client Side Filtering)
  const filteredValue = searchParams.get("discount") || "all";

  let filteredCabins;
  if (filteredValue === "all") filteredCabins = users;

  if (filteredValue === "no-discount")
    filteredCabins = users.filter((cabin) => Number(cabin.discount) === 0);

  if (filteredValue === "with-discount")
    filteredCabins = users.filter((cabin) => Number(cabin.discount) > 0);

  // Sort  The Value From The URL
  const sortedBy = searchParams.get("sortBy") || "startDate-asc";
  const [field, direction] = sortedBy.split("-");

  const modifier = direction === "asc" ? 1 : -1;
  const sortedRooms = filteredCabins.sort(
    (a, b) => (a[field] - b[field]) * modifier,
  );


  return (
    <>
      <Table>
        <Table.Header>
          <Table.Cell isHeader>{t("general.name")}</Table.Cell>
          <Table.Cell isHeader>{t("users.mobile")}</Table.Cell>
          <Table.Cell isHeader>{t("general.email")}</Table.Cell>
          <Table.Cell isHeader>{t("users.roomNumber")}</Table.Cell>
          <Table.Cell isHeader>{t("users.status")}</Table.Cell>
          <Table.Cell isHeader>{t("general.actions")}</Table.Cell>
        </Table.Header>
        <Table.Body
          data={sortedRooms}
          render={(room) => <UserRow user={room} key={room?._id} />}
        />
      </Table>

      <Pagination count={count} pageCount={totalPages} />
    </>
  );
}

export default UsersTable;
