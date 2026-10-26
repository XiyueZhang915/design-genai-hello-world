import { requireAccount } from "@/lib/profile";
import { Navigation } from "@/components/navigation";
import { CreateForm } from "@/components/create-form";

export const maxDuration = 60;

export default async function CreatePage() {
  const { supabase } = await requireAccount();
  const { error } = await supabase.from("generations").select("id").limit(1);
  const enabled = Boolean(process.env.GEMINI_API_KEY) && !error;
  return <main className="collection"><Navigation signedIn />
    <p className="eyebrow">TURN A NYC MOMENT INTO A PUNCHLINE</p><h1>The city gave you a story<span>.</span></h1>
    <p className="intro">Let AI take a shot at the caption. Think tiny café tables, subway plot twists, or a weekend that didn’t go to plan.</p>
    <section className="panel"><h2>Start with something that happened.</h2>
      <p>Specific moments make better jokes. You’re sharing a story, not reviewing a venue.</p>
      {!enabled && <p className="message" role="status">Generation is being set up. It will open when the AI connection and database are ready.</p>}
      <CreateForm enabled={enabled} />
    </section>
  </main>;
}
