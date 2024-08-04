const corsWhiteList =
    [
        "https://localhost",
        "http://localhost:3000",

        "http://localhost:3001"
    ]

const corsSettings = {
    origin: function (origin: any, callback: any) {
        if (origin === undefined) return callback(new Error('Not allowed by CORS'));
        if (corsWhiteList.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}

export default corsSettings;