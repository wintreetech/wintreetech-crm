import dotenv from "dotenv";
dotenv.config();

export const keys = {
    app: {
        name: "Wintreetech Tasks",
        apiUrl: `${process.env.BASE_API_URL}`,
        clientUrl: process.env.CLIENT_URL,
        mongoUrl: process.env.MONGO_URL,
    },
    aws: {
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        AWS_REGION: process.env.AWS_REGION,
        S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    },
    port: process.env.PORT || 3938,
    jwtSecret: process.env.JWT_SECRET,
};
