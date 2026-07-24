import { prisma } from "@/lib/prisma";

export type UserDataExport = {
  exportedAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    emailVerified: string | null;
    createdAt: string;
    autoTranslateConsent: boolean;
  };
  meditations: {
    id: string;
    title: string;
    content: string;
    visibility: string;
    isFavorite: boolean;
    createdAt: string;
    updatedAt: string;
  }[];
  likes: { meditationId: string; createdAt: string }[];
  translations: {
    meditationId: string;
    locale: string;
    title: string;
    content: string;
  }[];
};

export async function buildUserDataExport(userId: string): Promise<UserDataExport> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      createdAt: true,
      autoTranslateConsent: true,
      meditations: {
        select: {
          id: true,
          title: true,
          content: true,
          visibility: true,
          isFavorite: true,
          createdAt: true,
          updatedAt: true,
          translations: {
            select: {
              locale: true,
              title: true,
              content: true,
            },
          },
        },
      },
      likes: {
        select: { meditationId: true, createdAt: true },
      },
    },
  });

  const translations = user.meditations.flatMap((m) =>
    m.translations.map((t) => ({
      meditationId: m.id,
      locale: t.locale,
      title: t.title,
      content: t.content,
    })),
  );

  return {
    exportedAt: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
      autoTranslateConsent: user.autoTranslateConsent,
    },
    meditations: user.meditations.map((m) => {
      const { translations, ...rest } = m;
      void translations;
      return {
        ...rest,
        createdAt: rest.createdAt.toISOString(),
        updatedAt: rest.updatedAt.toISOString(),
      };
    }),
    likes: user.likes.map((l) => ({
      meditationId: l.meditationId,
      createdAt: l.createdAt.toISOString(),
    })),
    translations,
  };
}

export async function deleteUserAccount(userId: string) {
  await prisma.user.delete({ where: { id: userId } });
}
