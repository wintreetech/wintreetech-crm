import dotenv from "dotenv";
dotenv.config();

export const keys = {
	app: {
		name: "Wintreetech CRM",
		apiUrl: `${process.env.BASE_API_URL}`,
		clientUrl: process.env.CLIENT_URL,
		mongoUrl: process.env.MONGO_URL,
	},
	port: process.env.PORT || 3938,
	jwtSecret: process.env.JWT_SECRET,
};
