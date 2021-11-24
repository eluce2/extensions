import { ActionPanel, ActionPanelItem, closeMainWindow, List } from "@raycast/api";
import { useState, useEffect } from "react";
import { execSync } from "child_process";

export default function BookmarkList() {
  const [bookmarks, setBookmarks] = useState<RDPBookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  function init() {
    const result = fetchBookmarks();
    setBookmarks(result);
    setIsLoading(false);
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Filter bookmarks by name...">
      {bookmarks.map((bookmark) => (
        <BookmarkListItem key={bookmark.id} bookmark={bookmark} />
      ))}
    </List>
  );
}

function BookmarkListItem(props: { bookmark: RDPBookmark }) {
  const bookmark = props.bookmark;

  return (
    <List.Item
      id={bookmark.id}
      key={bookmark.id}
      title={bookmark.name}
      actions={
        <ActionPanel>
          <ActionPanelItem
            title="Open in Remote Desktop"
            onAction={() => {
              openBookmark(bookmark);
              closeMainWindow();
            }}
          />
        </ActionPanel>
      }
    />
  );
}

const mrdPath = '"/Applications/Microsoft Remote Desktop.app/Contents/MacOS/Microsoft Remote Desktop"';

function fetchBookmarks(): RDPBookmark[] {
  const stout = execSync(`${mrdPath} --script bookmark list`);
  const result = stout
    .toString()
    .split("\n")
    .reduce<RDPBookmark[]>((data, line) => {
      const lineAsArray = line.split(",");
      let name = lineAsArray[0] ?? "";
      let id = lineAsArray[1] ?? "";

      id = id.trim();
      name = name.replace(/['"]+/g, "").trim();

      data.push({
        id,
        name,
      });
      return data;
    }, []);
  return result;
}

function returnUri(bookmark: RDPBookmark): string {
  const stout = execSync(`${mrdPath} --script bookmark export ${bookmark.id} --uri`);
  const uri = stout.toString();
  return uri;
}

function openBookmark(bookmark: RDPBookmark) {
  const uri = returnUri(bookmark);
  const result = execSync(`open ${uri}`);
  console.log(result.toString());
}

type RDPBookmark = {
  id: string;
  name: string;
};
