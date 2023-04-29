import { useRouter } from "next/router";
import { useState } from "react";
import supabase from "../../utils/supabaseClient";

export default function Login() {
    const [email, setEmail] = useState<string | undefined>();
    const [password, setPassword] = useState<string | undefined>();
    const router = useRouter();

    async function signInWithEmail() {
        try {
            if (email && password) {
                const resp = await supabase.auth.signInWithPassword({ email: email, password: password});
                if (resp.error) {
                    throw resp.error;
                }
                const userID = resp.data.user?.id;
                console.log("user id: " + userID);
                router.push("/");
            }
        }
        catch {

        }
    }

    return (
        <div className="flex flex-col w-full justify-center items-center">  
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
            </label>
            <div className="mt-1">
                <input
                    type="email"
                    name="email"
                    id="email"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="you@example.com"
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mt-4">
                Password
            </label>
            <div className="mt-1">
                <input
                    type="password"
                    name="password"
                    id="password"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="password"
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <button
                type="button"
                className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                onClick={signInWithEmail}
            >
                Login
            </button>
        </div>
    );
}