import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaCalendarAlt, FaCalendarCheck, FaCheck } from "react-icons/fa";

function DateRangePicker({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange,
  period,
  onPeriodChange,
  periods = ["day", "week", "month", "year"],
  showPeriodSelector = true,
  showDatePickers = true,
  label = "Date Range"
}) {
  const [t] = useTranslation();
  const [useCustomDates, setUseCustomDates] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);

  // Sync local state when props change
  useEffect(() => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
  }, [startDate, endDate]);

  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const handleApply = () => {
    if (tempStartDate && tempEndDate) {
      onStartDateChange(tempStartDate);
      onEndDateChange(tempEndDate);
    }
  };

  const handleToggleCustomDates = () => {
    const newValue = !useCustomDates;
    setUseCustomDates(newValue);
    // If disabling custom dates, reset to period-based selection
    if (!newValue) {
      setTempStartDate(startDate);
      setTempEndDate(endDate);
    }
  };

  const hasChanges = () => {
    return tempStartDate !== startDate || tempEndDate !== endDate;
  };

  return (
    <div className="rounded-md bg-secondary p-[10px]">
      <div className="flex flex-col gap-4">
        {/* Period Selector Section */}
        {showPeriodSelector && (
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-textColor font-medium flex items-center gap-2">
              <FaCalendarAlt className="text-colorBrand" />
              {t("users.period")}:
            </label>
            <select
              value={period}
              onChange={(e) => {
                onPeriodChange(e.target.value);
                setUseCustomDates(false);
                setTempStartDate(startDate);
                setTempEndDate(endDate);
              }}
              className="px-4 py-2 rounded-md bg-primary border border-primary text-textColor focus:outline-none focus:border-colorBrand transition-all hover:border-colorBrand"
            >
              {periods.map((p) => (
                <option key={p} value={p}>
                  {t(`users.periodTypes.${p}`) || p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Custom Date Range Toggle Section */}
        {showDatePickers && (
          <div className="border-t border-primary pt-4">
            <div className="flex flex-col gap-4">
              {/* Toggle Button */}
              <button
                type="button"
                onClick={handleToggleCustomDates}
                className={`flex items-center justify-between w-full p-3 rounded-md transition-all ${
                  useCustomDates
                    ? "bg-colorBrand/10 border-2 border-colorBrand"
                    : "bg-primary border-2 border-primary hover:border-colorBrand/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md transition-all ${
                    useCustomDates ? "bg-colorBrand text-white" : "bg-primary text-textColor"
                  }`}>
                    <FaCalendarCheck className="text-lg" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-textColor">
                      {t("users.useCustomDateRange")}
                    </div>
                    <div className="text-xs text-textColor opacity-70">
                      {useCustomDates 
                        ? t("users.customDateRangeEnabled") || "Select specific start and end dates"
                        : t("users.customDateRangeDisabled") || "Use predefined period instead"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                    useCustomDates ? "bg-colorBrand" : "bg-gray-400"
                  }`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                      useCustomDates ? "translate-x-6" : "translate-x-0"
                    }`}></div>
                  </div>
                </div>
              </button>

              {/* Date Inputs - Animated */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  useCustomDates
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                {useCustomDates && (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-primary rounded-md border border-primary">
                      {/* Start Date */}
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-textColor mb-2 flex items-center gap-2">
                          <FaCalendarAlt className="text-xs text-colorBrand" />
                          {t("users.from")}:
                        </label>
                        <input
                          type="date"
                          value={formatDateForInput(tempStartDate)}
                          onChange={(e) => setTempStartDate(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-md bg-secondary border border-primary text-textColor focus:outline-none focus:border-colorBrand focus:ring-2 focus:ring-colorBrand/20 transition-all"
                        />
                      </div>

                      {/* End Date */}
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-textColor mb-2 flex items-center gap-2">
                          <FaCalendarAlt className="text-xs text-colorBrand" />
                          {t("users.to")}:
                        </label>
                        <input
                          type="date"
                          value={formatDateForInput(tempEndDate)}
                          onChange={(e) => setTempEndDate(e.target.value)}
                          min={formatDateForInput(tempStartDate)}
                          className="w-full px-4 py-2.5 rounded-md bg-secondary border border-primary text-textColor focus:outline-none focus:border-colorBrand focus:ring-2 focus:ring-colorBrand/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Apply Button */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleApply}
                        disabled={!tempStartDate || !tempEndDate || !hasChanges()}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-semibold text-sm transition-all ${
                          tempStartDate && tempEndDate && hasChanges()
                            ? "bg-colorBrand text-white hover:bg-colorBrand/90 shadow-md hover:shadow-lg"
                            : "bg-gray-400 text-gray-200 cursor-not-allowed"
                        }`}
                      >
                        <FaCheck />
                        {t("general.apply") || "Apply"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DateRangePicker;
