import { useTranslation } from "react-i18next";
import { useLogin } from "./useLogin";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { isOnlySpaces } from "../../utils/helpers";
import {
  EMAIL_REGEX,
  MAX_INPUT_LENGTH,
  MIN_INPUT_LENGTH,
} from "../../utils/constants";

import Input from "../../ui/Input";
import Button from "../../ui/Button";
import Heading from "../../ui/Heading";

import logo from "/logo2.jpg";

const initialState = {
  email: "",
  password: "",
};

function LoginForm() {
  const [t] = useTranslation();

  const { login, isLoading } = useLogin();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: initialState,
  });

  function onSubmit(data) {
    const { email, password } = data;

    login(
      { email, password },
      {
        onSuccess: () => {
          toast.success(t("login.successLogin"));
          reset();
        },
        onError: (error) => {
          if (error?.response?.data?.msg === "password not valid") {
            toast.error(t("login.passwordInValid"));
          } else if (error?.response?.data?.msg === "email not valid") {
            toast.error(t("login.emailInValid"));
          } else {
            toast.error(t("login.loginFailed"));
          }
        },
      },
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-[90%] flex-col gap-[10px] rounded-md bg-secondary p-[20px]"
      >
        <div className="mb-[20px]">
          <Heading>{t("login.title")}</Heading>
        </div>

        <Input
          placeholder={t("general.email")}
          disabled={isLoading}
          error={errors?.email?.message}
          {...register("email", {
            required: t("general.emailIsRequired"),
            validate: {
              noOnlySpaces: (value) =>
                !isOnlySpaces(value) || t("general.onlySpaces"),
            },
            pattern: {
              value: EMAIL_REGEX,
              message: t("general.emailPattern"),
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
          placeholder={t("general.passwordPlaceholder")}
          type="password"
          disabled={isLoading}
          error={errors?.password?.message}
          {...register("password", {
            required: t("general.passwordIsRequired"),
            minLength: {
              value: 7,
              message: t("general.passwordLength"),
            },
          })}
        />

        <Button type="submit" disabled={isLoading}>
          {!isLoading ? t("login.login") : <span>{t("general.loading")}</span>}
        </Button>
      </form>
      <img src={logo} alt="Logo" className="w-[80px] rounded-full" />
    </>
  );
}

export default LoginForm;
