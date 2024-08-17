const corsWhiteList =
    [
        "https://localhost",
        "http://localhost:3000",
    ]

const corsSettings = {
    origin: ["https://localhost", "http://localhost:3000", "http://localhost:3001"],
    credentials: true, // Allow cookies to be sent with the request
}

export default corsSettings;