import ForgotPasswordForm from "../components/ForgotPasswordForm";

function ForgotPassword() {
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
            <ForgotPasswordForm/>
        </div>
    );
}

export default ForgotPassword;
