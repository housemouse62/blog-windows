-- CreateTable
CREATE TABLE "Reply" (
    "id" SERIAL NOT NULL,
    "replybody" TEXT NOT NULL,
    "authorID" INTEGER,
    "commentID" INTEGER NOT NULL,
    "replytime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reply_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_authorID_fkey" FOREIGN KEY ("authorID") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_commentID_fkey" FOREIGN KEY ("commentID") REFERENCES "Comment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
