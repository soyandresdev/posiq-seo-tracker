import { useState } from "react";
import { Bell, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { useApp } from "../context/AppContext";
import { Button, Container } from "../components/ui";
import PageHeader from "../components/app/PageHeader";

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex items-start justify-between gap-6 py-4 cursor-pointer">
      <span>
        <span className="block font-semibold text-sm">{label}</span>
        {hint && (
          <span className="block text-sm text-muted-foreground mt-0.5">
            {hint}
          </span>
        )}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 mt-0.5 h-6 w-11 rounded-full transition-colors duration-200 ${checked ? "bg-primary" : "bg-lavender-deep"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-card transition-transform duration-300 ease-out-expo ${checked ? "translate-x-5" : ""}`}
        />
      </button>
    </label>
  );
}

export default function Settings() {
  const { user, updateSettings } = useApp();
  const [name, setName] = useState(user?.name ?? "");
  const [alerts, setAlerts] = useState(
    user?.alerts ?? { rankDrop: true, dropThreshold: 3, analysisDone: false },
  );
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const r = await updateSettings({ name, alerts });
    setSaving(false);
    if (r.success) toast.success("Settings saved");
    else toast.error(r.message ?? "Could not save");
  };

  return (
    <Container as="main" className="pt-28 pb-24">
      <PageHeader
        eyebrow="Settings"
        title="Your account."
        description={user?.email}
      />

      <section className="mt-8 card p-6">
        <div className="flex items-center gap-2 font-semibold">
          <Mail size={16} className="text-primary" /> Profile
        </div>
        <label className="block mt-5 max-w-sm">
          <span className="text-sm font-semibold block mb-1.5">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-11 px-4 rounded-xl bg-card border border-border text-sm outline-none focus:border-primary transition-colors"
          />
        </label>
        <div className="mt-4 text-sm text-muted-foreground">
          Plan:{" "}
          <span className="font-semibold text-foreground capitalize">
            {user?.plan}
          </span>
        </div>
      </section>

      <section className="mt-6 card p-6">
        <div className="flex items-center gap-2 font-semibold">
          <Bell size={16} className="text-primary" /> Email alerts
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Sent to {user?.email}. At most one alert per keyword per day.
        </p>
        <div className="mt-2 divide-y divide-border">
          <Toggle
            checked={alerts.rankDrop}
            onChange={(v) => setAlerts({ ...alerts, rankDrop: v })}
            label="Ranking drops"
            hint="When a keyword falls by the threshold below, or leaves the top 50."
          />
          <div
            className={`flex items-center justify-between gap-6 py-4 ${alerts.rankDrop ? "" : "opacity-50 pointer-events-none"}`}
          >
            <span>
              <span className="block font-semibold text-sm">
                Drop threshold
              </span>
              <span className="block text-sm text-muted-foreground mt-0.5">
                Alert when a keyword loses this many positions since the last
                check.
              </span>
            </span>
            <select
              value={alerts.dropThreshold}
              onChange={(e) =>
                setAlerts({ ...alerts, dropThreshold: Number(e.target.value) })
              }
              className="select-pill"
            >
              {[1, 2, 3, 5, 10].map((n) => (
                <option key={n} value={n}>
                  {n} position{n === 1 ? "" : "s"}
                </option>
              ))}
            </select>
          </div>
          <Toggle
            checked={alerts.analysisDone}
            onChange={(v) => setAlerts({ ...alerts, analysisDone: v })}
            label="Report ready"
            hint="An email with the score when an analysis finishes."
          />
        </div>
      </section>

      <div className="mt-6 flex justify-end">
        <Button onClick={save} loading={saving}>
          Save changes
        </Button>
      </div>
    </Container>
  );
}
