import Link from "next/link";
import Image from "next/image";
import { requireAccount, isComplete } from "@/lib/profile";
import { Navigation } from "@/components/navigation";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { supabase, user, profile } = await requireAccount();
  const { saved } = await searchParams;
  const avatarUrl = profile?.avatar_path ? supabase.storage.from("avatars").getPublicUrl(profile.avatar_path).data.publicUrl : null;
  return <main className="collection"><Navigation signedIn />
    <p className="eyebrow">A FACE BEHIND THE FAVORITES</p><h1>Your profile<span>.</span></h1>
    <p className="intro">Make yourself at home. You can update your details anytime.</p>
    {!isComplete(profile) && <p className="message" role="status">Welcome! Add your first and last name to finish setting up your profile.</p>}
    {saved === "1" && <p className="message success" role="status">Your profile has been saved. <Link href="/members">Visit the members’ corner →</Link></p>}
    <section className="panel" aria-label="Edit profile">
      <div className="profile-heading">
        {avatarUrl ? <Image className="avatar" src={avatarUrl} alt="Your profile photo" width={88} height={88} unoptimized /> : <div className="avatar avatar-placeholder" aria-label="No profile photo">{profile?.first_name?.slice(0, 1).toUpperCase() || "?"}</div>}
        <div><h2>{isComplete(profile) ? `${profile?.first_name} ${profile?.last_name}` : "Nice to meet you."}</h2><p>Your personal spot on the shelf.</p></div>
      </div>
      <ProfileForm profile={profile} email={user.email ?? ""} />
    </section>
  </main>;
}
