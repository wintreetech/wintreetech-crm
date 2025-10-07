import { create } from "zustand";

const useAuthStore = create((set) => ({
	//state
	currentUser: {
		username: "",
		email: "",
	},
	allUsers: [],

	//action
	setcurrentUser: (data) =>
		set(() => ({
			currentUser: {
				username: data.username,
				email: data.email,
			},
		})),

	setAllUsers: (users) =>
		set(() => ({
			allUsers: users,
		})),

	logout: () =>
		set(() => ({
			currentUser: {
				username: "",
				email: "",
			},
		})),
}));

export default useAuthStore;
