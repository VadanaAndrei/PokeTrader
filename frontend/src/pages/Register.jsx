import RegisterForm from "../components/RegisterForm";

function Register() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to right, white, #ff6666)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: "480px", width: "100%" }}>
        <RegisterForm />
      </div>
    </div>
  );
}

export default Register;
