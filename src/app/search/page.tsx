import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { UserSearchPage } from "./UserSearchPage";
import { getSuggestedUsers } from "@/lib/actions/search";

export default async function SearchPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const suggestedUsers = await getSuggestedUsers(session.user.id, 10);

    return (
        <div className="min-h-screen">
            <Navbar user={session.user} />
            <main className="max-w-3xl mx-auto px-6 py-8">
                <h1 className="text-2xl font-bold text-white mb-6">
                    🔍 Search Users
                </h1>
                <UserSearchPage
                    currentUserId={session.user.id}
                    suggestedUsers={suggestedUsers}
                />
            </main>
        </div>
    );
}
