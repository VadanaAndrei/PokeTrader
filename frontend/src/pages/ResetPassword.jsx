import ResetPasswordForm from "../components/ResetPasswordForm";

function ResetPassword() {
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
            <ResetPasswordForm/>
        </div>
    );
}

export default ResetPassword;
