import {
  ActionPanel,
  Action,
  Icon,
  List,
  useNavigation,
  Color,
  getApplications,
  getDefaultApplication,
  showToast,
  Toast,
} from "@raycast/api";
import AddEditProjectForm from "./form";
import { Project, useCheckStatus, useProjects } from "./hooks";
import { useState } from "react";

export default function Command() {
  const { projects } = useProjects();

  return (
    <List
      actions={
        <ActionPanel>
          <AddEditProjectAction />
        </ActionPanel>
      }
    >
      {projects.map((project) => (
        <RenderListItem project={project} key={project.id} />
      ))}
    </List>
  );
}

function AddEditProjectAction() {
  const { pop } = useNavigation();
  return (
    <Action.Push
      target={<AddEditProjectForm afterSubmit={() => pop()} />}
      title="Add"
      icon={{ source: Icon.Plus }}
      shortcut={{ key: "n", modifiers: ["cmd"] }}
    />
  );
}

function RenderListItem({ project }: { project: Project }) {
  const [isLoading, setIsLoading] = useState(false);
  const { pop } = useNavigation();
  const { isRunning, isSupabaseFolder, status, statusObj, startOrStop } = useCheckStatus(project.path);

  return (
    <List.Item
      key={project.id}
      icon={
        isLoading
          ? { source: Icon.Clock, tintColor: Color.Yellow }
          : { tintColor: isRunning ? Color.Green : Color.Red, source: Icon.Dot }
      }
      title={project.name}
      subtitle={project.path}
      actions={
        <ActionPanel>
          <Action
            title={isRunning ? "Stop" : "Start"}
            icon={{ source: isRunning ? Icon.Stop : Icon.Play }}
            onAction={async () => {
              if (isLoading) return;
              setIsLoading(true);
              await startOrStop();
              setIsLoading(false);
            }}
          />
          <Action.Open
            title="Open in VSCode"
            application="Visual Studio Code"
            target={project.path}
            icon={{ source: Icon.Code }}
            shortcut={{ key: "o", modifiers: ["cmd"] }}
          />
          <AddEditProjectAction />
          <Action.Push
            target={<AddEditProjectForm afterSubmit={() => pop()} project={project} />}
            title="Edit"
            icon={{ source: Icon.Pencil }}
            shortcut={{ key: "e", modifiers: ["cmd"] }}
          />
          {statusObj && isRunning && (
            <>
              <Action.OpenInBrowser
                url={statusObj["Studio URL"]}
                title="Open Local Studio"
                icon={{ source: Icon.Bolt }}
                shortcut={{ key: "o", modifiers: ["cmd", "shift"] }}
              />
              <Action.CopyToClipboard
                content={statusObj["DB URL"]}
                title="Copy DB URL"
                icon={{ source: Icon.Clipboard }}
              />
              <Action.CopyToClipboard
                content={statusObj["JWT secret"]}
                title="Copy JWT Secret"
                icon={{ source: Icon.Clipboard }}
              />
              <Action.CopyToClipboard
                content={statusObj["anon key"]}
                title="Copy Anon Key"
                icon={{ source: Icon.Clipboard }}
              />
              <Action.CopyToClipboard
                content={statusObj["service_role key"]}
                title="Copy Serivce Role Key"
                icon={{ source: Icon.Clipboard }}
              />
              <Action.CopyToClipboard
                content={statusObj["API URL"]}
                title="Copy API URL"
                icon={{ source: Icon.Clipboard }}
              />
            </>
          )}
        </ActionPanel>
      }
    />
  );
}
