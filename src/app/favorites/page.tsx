import { redirect } from "next/navigation";

export default function FavoritesPage() {
  redirect("/drills?favorites=true");
}
