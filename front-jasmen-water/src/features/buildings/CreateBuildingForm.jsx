import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { isOnlySpaces } from "../../utils/helpers";
import {
  MAX_INPUT_LENGTH,
  MIN_INPUT_LENGTH,
} from "../../utils/constants";
import { useUpdateBuilding } from "./useUpdateBuilding";
import { useCreateBuilding } from "./useCreateBuilding";
import { baseURL } from "../../services/axios";

import Input from "../../ui/Input";
import Button from "../../ui/Button";
import toast from "react-hot-toast";

function CreateBuildingForm({ buildingToEdit, onCloseModal }) {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    buildingToEdit?.buildingLogo ? `${baseURL}${buildingToEdit.buildingLogo}` : null
  );

  const { isUpdating, updateBuilding } = useUpdateBuilding();
  const { isCreating, createBuilding } = useCreateBuilding();

  const isEditSession = Boolean(buildingToEdit);

  const { register, handleSubmit, formState, reset } = useForm({
    defaultValues: isEditSession
      ? {
          buildingName: buildingToEdit?.buildingName,
          buildingAddress: buildingToEdit?.buildingAddress,
          buildingCode: buildingToEdit?.buildingCode,
          buildingDescription: buildingToEdit?.buildingDescription,
        }
      : {},
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  function onSubmit(data) {
    const formData = {
      ...data,
      buildingLogo: selectedImage || (isEditSession ? buildingToEdit?.buildingLogo : null),
    };

    if (isEditSession) {
      updateBuilding(
        { id: buildingToEdit?._id, data: formData },
        {
          onSuccess: () => {
            toast.success(t("buildings.updatedSuccessfully"));
            onCloseModal?.();
          },
          onError: () => {
            toast.error(t("buildings.updateFailed"));
          },
        },
      );
    } else {
      createBuilding(
        formData,
        {
          onSuccess: (data) => {
            toast.success(t("buildings.createSuccess"));
            reset();
            setSelectedImage(null);
            setImagePreview(null);
            onCloseModal?.();
          },
          onError: () => {
            toast.error(t("buildings.createFailed"));
          },
        },
      );
    }
  }

  const isWorking = isCreating || isUpdating;

  const { errors } = formState;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-[10px] text-textColor"
    >
      <h2 className="my-[10px] text-xl capitalize">
        {isEditSession ? t("buildings.editBuilding") : t("buildings.createBuilding")}
      </h2>
      
      <Input
        placeholder={t("buildings.buildingName")}
        disabled={isWorking}
        error={errors?.buildingName?.message}
        {...register("buildingName", {
          required: t("buildings.buildingNameRequired"),
          validate: {
            noOnlySpaces: (value) =>
              !isOnlySpaces(value) || t("general.onlySpaces"),
          },
          minLength: {
            value: MIN_INPUT_LENGTH,
            message: t("general.minLength"),
          },
          maxLength: {
            value: MAX_INPUT_LENGTH,
            message: t("general.maxLength"),
          },
        })}
      />

      <Input
        placeholder={t("buildings.buildingAddress")}
        disabled={isWorking}
        error={errors?.buildingAddress?.message}
        {...register("buildingAddress", {
          validate: {
            noOnlySpaces: (value) =>
              !isOnlySpaces(value) || t("general.onlySpaces"),
          },
          maxLength: {
            value: MAX_INPUT_LENGTH,
            message: t("general.maxLength"),
          },
        })}
      />

      <Input
        placeholder={t("buildings.buildingCode")}
        disabled={isWorking}
        error={errors?.buildingCode?.message}
        {...register("buildingCode", {
          validate: {
            noOnlySpaces: (value) =>
              !isOnlySpaces(value) || t("general.onlySpaces"),
          },
          maxLength: {
            value: MAX_INPUT_LENGTH,
            message: t("general.maxLength"),
          },
        })}
      />

      <Input
        placeholder={t("buildings.buildingDescription")}
        disabled={isWorking}
        error={errors?.buildingDescription?.message}
        {...register("buildingDescription", {
          validate: {
            noOnlySpaces: (value) =>
              !isOnlySpaces(value) || t("general.onlySpaces"),
          },
          maxLength: {
            value: MAX_INPUT_LENGTH,
            message: t("general.maxLength"),
          },
        })}
      />

      {/* Image Upload Section */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-textColor">
          {t("buildings.buildingLogo")} ({t("general.optional")})
        </label>
        
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isWorking}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Building logo preview"
                className="h-16 w-16 rounded-lg object-cover border-2 border-gray-300"
              />
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                disabled={isWorking}
              >
                ×
              </button>
            </div>
          )}
        </div>
        
        {!imagePreview && (
          <div className="h-16 w-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
            {t("buildings.noImage")}
          </div>
        )}
      </div>

      <div className="mt-[20px] flex w-[40%] flex-col gap-[10px] self-end">
        <Button
          variation="secondary"
          type="reset"
          onClick={() => onCloseModal?.()}
        >
          {t("general.cancel")}
        </Button>
        <Button type="submit" disabled={isWorking}>
          {isEditSession ? t("buildings.editBuilding") : t("buildings.createBuilding")}
        </Button>
      </div>
    </form>
  );
}

export default CreateBuildingForm;
