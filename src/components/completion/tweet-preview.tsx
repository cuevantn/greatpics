"use client";

import * as React from "react";
import { Button, buttonVariants } from "../ui/button";
import Image from "next/image";
import { Dot } from "lucide-react";
import { AspectRatio } from "../ui/aspect-ratio";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/ui";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { PopoverClose } from "@radix-ui/react-popover";
import { extractAI } from "@/lib/utils/demo_examples";

interface User {
  name: string;
  username: string;
}

const fetchUser = async () => {
  const res = await fetch("https://randomuser.me/api?nat=us,fr&inc=name,login");
  const data = await res.json();

  const username = data.results[0].login.username;
  const name = data.results[0].name.first + " " + data.results[0].name.last;
  return { username, name } as User;
};

export const TweetPreview = ({
  url,
  aspect_ratio,
  completion,
}: {
  url: string;
  aspect_ratio: number;
  completion: string;
}) => {
  const [tweet, alt] = extractAI(completion);
  const [user, setUser] = React.useState<User | null>(null);
  const profile_pic = React.useMemo(() => {
    const options = [
      "lorelei",
      "micah",
      "notionists",
      "open-peeps",
      "avataaars",
      "big-ears",
      "croodles",
    ];
    const random = Math.floor(Math.random() * options.length);
    const seed = (Math.random() + 1).toString(36).substring(7);
    return `https://api.dicebear.com/6.x/${options[random]}/svg?seed=${seed}`;
  }, []);

  React.useEffect(() => {
    fetchUser().then((user) => setUser(user));
  }, []);

  return (
    <div className="w-full gap-4 flex border rounded-lg p-4 pr-8">
      <Image
        alt={alt}
        src={profile_pic}
        width={40}
        height={40}
        className="w-12 h-12 rounded-full bg-border"
      />
      <div className="flex flex-col w-full">
        {user ? (
          <div className="flex flex-wrap gap-x-1">
            <div className="font-bold">{user?.name}</div>
            <div className="text-muted-foreground">@{user?.username}</div>
            <div className="flex items-center justify-center">
              <Dot className="w-2 h-2" />
            </div>
            <div className="text-muted-foreground">1h</div>
          </div>
        ) : (
          <div className="flex gap-1 w-[80%] mb-2">
            <div className="w-[50%] h-4 bg-border animate-pulse rounded-full" />
            <div className="w-[40%] h-4 bg-border animate-pulse rounded-full" />
            <div className="w-[10%] h-4 bg-border animate-pulse rounded-full" />
          </div>
        )}
        <p className="mb-3">{tweet}</p>

        <div
          className={cn("rounded-xl border overflow-hidden relative", {
            "max-w-sm": aspect_ratio === 4 / 5 || aspect_ratio === 3 / 4,
          })}
        >
          <AspectRatio ratio={aspect_ratio} className="">
            <Image alt={alt} src={url} fill className="object-cover" />
          </AspectRatio>

          {!!alt && (
            <Popover>
              <PopoverTrigger asChild>
                <motion.button
                  initial={{ opacity: 0, scale: 2 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "rounded-lg absolute bottom-2 left-2 h-min w-min py-1 px-2 font-bold tracking-wide bg-black/70 hover:bg-black/80"
                  )}
                >
                  ALT
                </motion.button>
              </PopoverTrigger>
              <PopoverContent className="w-80 rounded-lg text-foreground">
                  <div className="font-bold text-2xl">Image description</div>
                  <div className="my-2 text-sm">{alt}</div>
                  <PopoverClose asChild>
                    <Button className="mt-2 w-full rounded-full font-bold text-lg">
                      Dismiss
                    </Button>
                  </PopoverClose>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </div>
  );
};