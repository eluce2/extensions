import { Form, ActionPanel, Action, Icon, useNavigation, showToast, Toast } from "@raycast/api";
import { nanoid } from "nanoid";
import { getCommandForCurrentSettings } from "../utils/getCommandForCurrentSettings";
import { useFavorites } from "../utils/use-favorites";
import { useForm } from "@raycast/utils";

export function Favorite({ fav }: { fav?: Favorite }) {
  const { favorites, isLoading, addOrUpdate } = useFavorites();
  const { pop } = useNavigation();

  const { handleSubmit, itemProps } = useForm<Favorite & { overwrite: boolean }>({
    initialValues: fav ?? { id: nanoid(), name: "", command: "" },
    onSubmit: async (fav) => {
      const command = await getCommandForCurrentSettings();
      if (!command) {
        showToast({ title: "Error", message: "Could not get current settings", style: Toast.Style.Failure });
        return;
      }
      await addOrUpdate({ ...fav, command });
      pop();
    },
  });

  return (
    <Form
      isLoading={isLoading}
      navigationTitle={`${fav ? "Edit" : "New"} DisplayPlacer Preset`}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title={fav ? "Save Changes" : "Create Preset"}
            icon={fav ? Icon.Document : Icon.Plus}
            onSubmit={handleSubmit}
          />
        </ActionPanel>
      }
    >
      <Form.TextField title="Preset Name" {...itemProps.name} />
      <Form.TextField title="Subtitle" placeholder="Short description shown next to title" {...itemProps.subtitle} />
      {fav !== undefined && (
        <Form.Checkbox
          label="Overwrite saved display settings with current display settings"
          {...itemProps.overwrite}
        />
      )}
    </Form>
  );
}
