import { UserPlus } from "lucide-react";
import React from "react";
import Login from "./Login";

function Unauthorized() {
	return (
		<>
			<div className="flex items-center justify-center h-screen">
				<h1 className="text-3xl font-bold text-red-600">403 - Unauthorized</h1>
			</div>
		</>
	);
}

export default Unauthorized;
