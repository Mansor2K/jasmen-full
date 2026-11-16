import LoginForm from "../features/authentication/LoginForm";
import Logo from "../ui/Logo";
import TranslationButton from "../ui/header/TranslationButton";
import loginImage from "/bg.jpeg";

function Login() {
  return (
    <main className="flex items-center justify-center gap-[20px] bg-primary text-textColor">
      <div
        className="relative hidden h-screen lg:block lg:w-[50%]"
        style={{
          backgroundImage: `url(${loginImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute top-[-35px] ltr:left-[10px] rtl:right-[10px]">
          <Logo />
        </div>

        <div className="absolute left-0 top-0 h-full w-full bg-colorBrand opacity-[0.1]" />
      </div>
      <div className="relative flex h-screen w-full flex-col items-center justify-center gap-[10px] text-center lg:w-[50%]">
        <LoginForm />

        <div className="absolute top-[20px] ltr:left-[20px] rtl:right-[20px]">
          <TranslationButton />
        </div>
      </div>
    </main>
  );
}

export default Login;
