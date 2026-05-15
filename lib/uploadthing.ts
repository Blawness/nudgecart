import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "./auth";

const f = createUploadthing();

export const uploadRouter = {
  productImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) throw new Error("Unauthorized");
      return { userId: session.user.id! };
    })
    .onUploadComplete(async ({ metadata }) => {
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
