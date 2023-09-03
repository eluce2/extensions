import { Toast, getPreferenceValues, showToast } from "@raycast/api";
import { useCachedState, useExec } from "@raycast/utils";
import { spawn } from "child_process";
import { v4 as uuid } from "uuid";

type Preferences = { path?: string };
const prefPath = getPreferenceValues<Preferences>().path;
export const PATH =
  !!prefPath && prefPath !== "" ? prefPath : "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin";

export type Status = {
  "API URL": string;
  "GraphQL URL": string;
  "DB URL": string;
  "Studio URL": string;
  "Inbucket URL": string;
  "JWT secret": string;
  "anon key": string;
  "service_role key": string;
};

export function useCheckStatus(cwd?: string) {
  const { data: supabaseVersion } = useExec(`zsh -l -c 'supabase -v'`, { shell: true, env: { PATH } });
  const hasCLI = !!supabaseVersion;

  const { data: status, revalidate } = useExec(`zsh -l -c 'supabase status'`, {
    env: { PATH },
    shell: true,
    cwd,
    execute: !!hasCLI && !!cwd,
    parseOutput: (output) => {
      return output.exitCode === 1 ? output.stderr : output.stdout;
    },
  });

  const isRunning = !hasCLI
    ? false
    : status?.includes("No such container:")
    ? false
    : status?.includes("is not running: exited")
    ? false
    : status?.includes("supabase local development setup is running") || status?.includes("API URL:");
  // console.log({ status, isRunning });
  const isSupabaseFolder = !hasCLI ? false : !status?.includes("cannot read config");

  const statusObj = status?.split("\n").reduce((acc, line) => {
    const [key, value] = line.split(": ");
    return { ...acc, [key.trim()]: value };
  }, {} as Status);

  async function startOrStop() {
    if (!hasCLI) return;
    if (!isSupabaseFolder) return;

    const toast = await showToast({
      title: isRunning ? "Stopping" : "Starting",
      message: `Supabase local development...`,
      style: Toast.Style.Animated,
    });

    return new Promise((resolve, reject) => {
      const ev = spawn(`supabase ${isRunning ? "stop" : "start"}`, { cwd, env: { PATH }, shell: "zsh" });
      ev.stdout.on("data", (msg) => {
        console.log(msg.toString());
        toast.message = msg.toString();
      });
      ev.stderr.on("data", (msg) => {
        console.log(msg.toString());
        toast.message = msg.toString();
      });

      ev.on("close", (code) => {
        console.log(`child process exited with code ${code}`);
        revalidate();
        toast.hide().then(() => resolve(code));
      });
    });
  }

  return { status, hasCLI, isRunning, statusObj, isSupabaseFolder, startOrStop };
}

export type Project = {
  id: string;
  path: string;
  name: string;
};

export function useProjects() {
  const [projects, setProjects] = useCachedState<Project[]>("projects", []);

  function addProject(data: Omit<Project, "id">) {
    setProjects((old) => [...old, { ...data, id: uuid() }]);
  }
  function editProject(data: Project) {
    setProjects((old) => old.map((p) => (p.id === data.id ? data : p)));
  }
  function removeProject(id: string) {
    setProjects((old) => old.filter((p) => p.id !== id));
  }

  return { projects, addProject, editProject, removeProject };
}
