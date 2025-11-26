import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server";
import ffmpeg from "fluent-ffmpeg"

const f = createUploadthing();

const handleAuth = async () => {
  const userId = await auth()
  if (!userId) throw new Error("Unauthorized")
  return { userId: userId }
}

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  serverImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(({ file }) => {
      return { fileUrl: file.url };
    }),
  messageFile: f({
    image: {maxFileSize: "8MB"},
    pdf: {maxFileSize: "8MB"},
    video: {maxFileSize: "32MB"}
  })
    .middleware(() => handleAuth())
    .onUploadComplete(({ file }) => {

      const path = Date.now() + "thumnail.png"

      ffmpeg(file.url)
      .seekInput("00:00:01")
      .frames(1)
      .output(path)
      

      return { fileUrl: file.url, thumbnail: file.type};
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
