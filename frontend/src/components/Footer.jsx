function Footer() {
    return (
        <footer style={{
            background: "#333333",
            color: "white",
            padding: "1rem",
            fontFamily: "Tektur, sans-serif",
            textAlign: "center",
            fontSize: "0.9rem",
            marginTop: "auto"
        }}>
            <p>PokeTrader © 2025. All rights reserved.</p>
            <div style={{ marginTop: "0.5rem" }}>
                <a target="_blank" href="https://github.com/VadanaAndrei" style={{ color: "white", textDecoration: "underline", marginRight: "1rem" }}>GitHub</a>
                <a target="_blank" href="https://www.linkedin.com/in/andrei-vadana-2b70a5338/" style={{ color: "white", textDecoration: "underline" , marginRight: "1rem"}}>Contact</a>
                <a href="/about" style={{ color: "white", textDecoration: "underline", marginRight: "1rem" }}>About</a>
            </div>
        </footer>
    );
}

export default Footer;
