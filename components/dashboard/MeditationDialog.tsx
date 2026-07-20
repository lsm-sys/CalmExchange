"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  meditationFormSchema,
  type MeditationFormValues,
} from "@/lib/meditations/schemas";
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

  const form = useForm<MeditationFormValues>({
    resolver: zodResolver(meditationFormSchema),
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
            {isEdit ? "Редактировать медитацию" : "Новая медитация"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Измените заголовок, текст или видимость."
              : "Создайте медитацию для личного использования или публикации."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Заголовок</Label>
            <Input
              id="title"
              placeholder="Утренняя практика"
              {...form.register("title")}
            />
            {form.formState.errors.title ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Текст медитации</Label>
            <Textarea
              id="content"
              placeholder="Опишите практику, шаги, намерение…"
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
                Публичная медитация
              </Label>
              <p className="text-xs text-muted-foreground">
                Будет видна всем на вкладке «Публичные»
              </p>
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
              Отмена
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Сохранение…
                </>
              ) : isEdit ? (
                "Сохранить"
              ) : (
                "Создать"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
