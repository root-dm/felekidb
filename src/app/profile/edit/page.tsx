import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { EditProfileForm } from "./EditProfileForm";

export default async function EditProfilePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen">
            <Navbar user={session.user} />
            <main className="max-w-2xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Edit Profile</h1>
                    <p className="text-gray-400">Manage your account settings</p>
                </div>

                <div className="space-y-8">
                    <EditProfileForm user={session.user} />
                </div>
            </main>
        </div>
    );
}
