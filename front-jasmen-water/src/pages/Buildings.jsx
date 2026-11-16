import { useTranslation } from "react-i18next";
import { FaPlus, FaTable, FaTh } from "react-icons/fa";
import { useState } from "react";

import BuildingsTable from "../features/buildings/BuildingsTable";
import BuildingCard from "../features/buildings/BuildingCard";
import Heading from "../ui/Heading";
import Row from "../ui/Row";
import AddEditBuilding from "../features/buildings/AddEditBuilding";
import Button from "../ui/Button";
import { useBuildings } from "../features/buildings/useBuildings";
import Spinner from "../ui/spinner/Spinner";
import Empty from "../ui/Empty";

function Buildings() {
  const [t] = useTranslation();
  const [viewMode, setViewMode] = useState("table");
  
  const { isLoading, buildings, error } = useBuildings();

  if (isLoading) return <Spinner height="h-[calc(100vh-160px)]" />;
  if (!buildings?.length) return <Empty message={t("buildings.noBuildings")} />;
  if (error) return <Empty message={t("general.failedToGetData")} />;

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="rounded-md bg-secondary p-[10px]">
        <Row>
          <Heading>{t("buildings.buildings")}</Heading>
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 ${
                  viewMode === "table"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <FaTable />
                {t("buildings.tableView")}
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 ${
                  viewMode === "card"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <FaTh />
                {t("buildings.cardView")}
              </button>
            </div>
            
            {/* Create Building Button */}
            <AddEditBuilding>
              <div className="w-[200px]">
                <Button>
                  <span className="flex items-center justify-around">
                    {t("buildings.createBuilding")}
                    <FaPlus />
                  </span>
                </Button>
              </div>
            </AddEditBuilding>
          </div>
        </Row>
      </div>

      {/* Content based on view mode */}
      {viewMode === "table" ? (
        <BuildingsTable />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {buildings.map((building) => (
            <BuildingCard key={building._id} building={building} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Buildings;
