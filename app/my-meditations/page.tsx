import { redirect } from "next/navigation";

/** Legacy-маршрут → новый личный кабинет. */
export default function MyMeditationsRedirect() {
  redirect("/dashboard");
}
