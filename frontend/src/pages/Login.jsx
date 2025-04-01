import LoginForm from "../components/LoginForm";

function Login() {
    return (
        <div
            style={{
                height: "100vh",
                overflow: "hidden",
                background: "linear-gradient(to right, white, #ff6666)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <LoginForm/>
        </div>
    );
}

export default Login;
