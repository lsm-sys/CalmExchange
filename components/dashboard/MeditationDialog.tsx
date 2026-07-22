"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  createMeditation,
  updateMeditation,
} from "@/lib/meditations/actions";
import {
  useMeditationFormSchema,
  type MeditationFormValues,
} from "@/lib/meditations/use-meditation-form-schema";
import type { MeditationItem } from "@/lib/meditations/types";

type MeditationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meditation?: MeditationItem | null;
  onSuccess?: () => void;
};

export function MeditationDialog({
  open,
  onOpenChange,
  meditation,
  onSuccess,
}: MeditationDialogProps) {
  const isEdit = Boolean(meditation);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("meditationForm");
  const tc = useTranslations("common");
  const schema = useMeditationFormSchema();

  const form = useForm<MeditationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      content: "",
      isPublic: false,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: meditation?.title ?? "",
        content: meditation?.content ?? "",
        isPublic: meditation?.isPublic ?? false,
      });
      setError(null);
    }
  }, [open, meditation, form]);

  function onSubmit(values: MeditationFormValues) {
    setError(null);
    startTransition(async () => {
      const result = isEdit && meditation
        ? await updateMeditation(meditation.id, values)
        : await createMeditation(values);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      onOpenChange(false);
      onSuccess?.();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("editTitle") : t("createTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t("editDescription") : t("createDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t("titleLabel")}</Label>
            <Input
              id="title"
              placeholder={t("titlePlaceholder")}
              {...form.register("title")}
            />
            {form.formState.errors.title ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">{t("contentLabel")}</Label>
            <Textarea
              id="content"
              placeholder={t("contentPlaceholder")}
              rows={6}
              {...form.register("content")}
            />
            {form.formState.errors.content ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.content.message}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-3">
            <div>
              <Label htmlFor="isPublic" className="cursor-pointer">
                {t("publicLabel")}
              </Label>
              <p className="text-xs text-muted-foreground">{t("publicHint")}</p>
            </div>
            <Switch
              id="isPublic"
              checked={form.watch("isPublic")}
              onCheckedChange={(checked) => form.setValue("isPublic", checked)}
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {tc("cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  {tc("saving")}
                </>
              ) : isEdit ? (
                tc("save")
              ) : (
                tc("create")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
