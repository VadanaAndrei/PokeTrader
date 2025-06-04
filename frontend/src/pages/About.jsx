function About() {
    return (
        <div
            style={{
                minHeight: "100vh",
                padding: "4rem 2rem",
                background: "linear-gradient(to right, white, #ffcccc)",
                fontFamily: "Tektur, sans-serif",
                color: "#333",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
            }}
        >
            <h1 style={{fontSize: "2.8rem", marginBottom: "1.5rem"}}>About PokeTrader</h1>

            <p style={{fontSize: "1.1rem", maxWidth: "800px", marginBottom: "1.5rem"}}>
                <strong>PokeTrader</strong> is a fan-made web app that lets users manage their Pokémon trading card
                collections and propose trades with other fans.
            </p>

            <h1 style={{fontSize: "2.2rem", marginBottom: "1.5rem"}}>How to Use</h1>

            <p style={{fontSize: "1.1rem", maxWidth: "800px", marginBottom: "1.5rem"}}>
                After you create an account, you can register your real-life collection on the site using
                the <strong>"Cards"</strong> section of the navbar.
                If you don't own any real cards yet, you can play the <strong>"Guess the Pokémon Game"</strong> daily to
                win some coins, which
                you can use to trade for cards with other users.
                Once you've registered your collection, you can either create a trade from
                the <strong>"Collection"</strong> page or browse trades posted by other users.
                When two users enter a trade, they can communicate using the chat feature and arrange how to exchange
                the cards in real life.
                After both users confirm that the trade has successfully taken place, the cards are exchanged on the
                site as well,
                and they can rate each other in the <strong>"Profile"</strong> section.

            </p>

        </div>
    );
}

export default About;
