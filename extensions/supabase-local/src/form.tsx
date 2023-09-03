import { Action, ActionPanel, Form } from "@raycast/api";
import { useForm } from "@raycast/utils";
import React from "react";
import { Project, useCheckStatus, useProjects } from "./hooks";

type FormValues = Omit<Project, "path"> & {
  path: string[];
};

export default function AddEditProjectForm(props?: { project?: Project; afterSubmit?: () => void }) {
  const { addProject, editProject } = useProjects();
  const { handleSubmit, itemProps, values, setValue } = useForm<FormValues>({
    initialValues: props?.project ? { ...props.project, path: [props.project.path] } : { name: "", path: [] },
    onSubmit: (values) => {
      props?.project?.id
        ? editProject({ ...values, path: values.path[0], id: props.project.id })
        : addProject({ ...values, path: values.path[0] });

      props?.afterSubmit?.();
    },
  });
  const { hasCLI, isRunning, statusObj, isSupabaseFolder } = useCheckStatus(values.path?.[0]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description text='Select your root project folder where you already ran the "supabase init" command' />
      <Form.FilePicker
        {...itemProps.path}
        title="Project Folder"
        canChooseDirectories
        canChooseFiles={false}
        allowMultipleSelection={false}
        error={isSupabaseFolder ? undefined : "Must be a supabase folder"}
        onChange={(paths) => {
          setValue("path", paths);
          const folder = paths[0];
          if (!folder) return;

          // don't set the name if unless it's empty
          if (values.name !== "" && values.name !== undefined) return;

          const asArray = folder.split("/");
          const lastItem = asArray.pop();
          if (lastItem === "supabase") {
            // set name to the parent folder
            const parentFolder = asArray.pop();
            parentFolder && setValue("name", parentFolder);
            setValue("path", [asArray.join("/")]);
          } else {
            // set name to the last item
            lastItem && setValue("name", lastItem);
          }
        }}
      />
      <Form.TextField {...itemProps.name} title="Name" info="To be displayed in the list view" />
      {values.path.length && isSupabaseFolder && (
        <Form.Description title="Container Status" text={isRunning ? "Running" : "Not running"} />
      )}
    </Form>
  );
}
