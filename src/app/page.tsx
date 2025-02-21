import Link from "next/link";

import { LatestPost } from "~/app/_components/post";
import { api, HydrateClient } from "~/trpc/server";
import { BeatButton, FXButton, RadioButton, SoundButtons } from "~/ui/buttons";
import { EmojiGrid } from "~/ui/buttons";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });

  void api.post.getLatest.prefetch();

  return (
    <SoundButtons />
  );
}
