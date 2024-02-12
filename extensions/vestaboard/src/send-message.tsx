import { Action, ActionPanel, Form, Toast, showToast } from "@raycast/api";
import { showFailureToast, useForm } from "@raycast/utils";
import { vesta } from "./vestaboard";

interface SignUpFormValues {
  message: string;
}

export default function SendMessage() {
  const { handleSubmit, itemProps } = useForm<SignUpFormValues>({
    onSubmit: async (values) => {
      try {
        const toast = await showToast({ title: "Sending...", style: Toast.Style.Animated });
        await vesta.postMessage(values.message);
        toast.title = "Message Sent";
        toast.style = Toast.Style.Success;
      } catch (error) {
        showFailureToast(error, { title: "Error" });
      }
    },
    validation: {
      message: (value) => {
        try {
          const invalid = vesta.containsNonDisplayCharacter(value ?? "");
          if (invalid) {
            return "Message contains non-displayable characters";
          }
        } catch (error) {}
      },
    },
  });
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Submit" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextArea title="Message" placeholder="Enter message to display" {...itemProps.message} />
    </Form>
  );
}
