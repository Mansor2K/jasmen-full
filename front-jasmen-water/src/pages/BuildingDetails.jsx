import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaUsers, FaBuilding } from "react-icons/fa";

import { useBuildingDetails } from "../features/buildings/useBuildingDetails";
import BuildingInfo from "../features/buildings/BuildingInfo";
import BuildingUsers from "../features/buildings/BuildingUsers";
import AssignUsers from "../features/buildings/AssignUsers";
import Heading from "../ui/Heading";
import Row from "../ui/Row";
import Spinner from "../ui/spinner/Spinner";
import Empty from "../ui/Empty";

function BuildingDetails() {
  const { id } = useParams();
  const [t] = useTranslation();
  
  const { building, isLoading, error } = useBuildingDetails(id);

  if (isLoading) return <Spinner height="h-[calc(100vh-160px)]" />;
  if (error) return <Empty message={t("buildings.buildingNotFound")} />;
  if (!building) return <Empty message={t("buildings.buildingNotFound")} />;

  return (
    <div className="flex flex-col gap-[20px]">
      {/* Building Header */}
      <div className="rounded-md bg-secondary p-[10px]">
        <Row>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <FaBuilding className="text-white text-2xl" />
            </div>
            <div>
              <Heading className="text-2xl">{building.buildingName}</Heading>
              <p className="text-textColor opacity-70 mt-1">
                {t("buildings.buildingDetails")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-colorBrand">
                {building.userCount || 0}
              </div>
              <div className="text-sm text-textColor opacity-70">
                {t("buildings.totalUsers")}
              </div>
            </div>
          </div>
        </Row>
      </div>

      {/* Building Information */}
      <BuildingInfo building={building} />

      {/* Building Users */}
      <div className="rounded-md bg-secondary p-[10px]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <FaUsers className="text-white text-lg" />
            </div>
            <Heading>{t("buildings.buildingUsers")}</Heading>
            <span className="bg-colorBrand text-white px-3 py-1 rounded-full text-sm font-medium">
              {building.users?.length || 0}
            </span>
          </div>
          <AssignUsers buildingId={id} />
        </div>
        <BuildingUsers users={building.users || []} buildingId={id} />
      </div>
    </div>
  );
}

export default BuildingDetails;
