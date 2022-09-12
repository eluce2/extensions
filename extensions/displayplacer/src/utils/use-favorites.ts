import { LocalStorage } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";

export function useFavorites() {
  const { data: favs, isLoading, revalidate } = useCachedPromise(getFavorites, [], { initialData: [] });

  async function addOrUpdate(fav: Favorite) {
    const index = favs.findIndex((f) => f.id === fav?.id);
    const newFavs = [...favs];
    if (index) {
      newFavs[index] = fav;
    } else {
      newFavs.push(fav);
    }
    LocalStorage.setItem("favorites", JSON.stringify(newFavs));
    revalidate();
  }
  async function remove(index: number) {
    const newFavs = [...favs];
    newFavs.splice(index, 1);
    LocalStorage.setItem("favorites", JSON.stringify(newFavs));
    revalidate();
  }

  return { favorites: favs, isLoading, addOrUpdate, remove };
}

function getFavorites(): Promise<Favorite[]> {
  const myFavs = LocalStorage.getItem("favorites");
  return myFavs ? JSON.parse(myFavs.toString()) : [];
}
