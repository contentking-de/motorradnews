"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Pencil,
  Plus,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

type UserRow = {
  id: string;
  name: string;
  slug: string | null;
  email: string;
  role: "ADMIN" | "EDITOR";
  bio: string | null;
  isActive: boolean;
  createdAt: string;
};

const selectClass =
  "w-full rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#E31E24] focus:border-transparent";

function roleLabel(role: "ADMIN" | "EDITOR"): string {
  return role === "ADMIN" ? "Administrator" : "Redakteur";
}

function generatePassword(length = 14): string {
  const chars =
    "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (x) => chars[x % chars.length]).join("");
}

export default function RedakteurePage() {
  const { data: session, status: sessionStatus } = useSession();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<"ADMIN" | "EDITOR">("EDITOR");
  const [formPassword, setFormPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"ADMIN" | "EDITOR">("EDITOR");
  const [editPassword, setEditPassword] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const isAdmin = session?.user?.role === "ADMIN";
  const currentUserId = session?.user?.id;

  const loadUsers = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users");
      if (!res.ok) {
        throw new Error("load_failed");
      }
      const data: UserRow[] = await res.json();
      setUsers(data);
    } catch {
      setError("Benutzer konnten nicht geladen werden.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (sessionStatus === "authenticated" && isAdmin) {
      loadUsers();
    } else if (sessionStatus === "authenticated" && !isAdmin) {
      setLoading(false);
    }
  }, [sessionStatus, isAdmin, loadUsers]);

  function openCreateModal() {
    setFormName("");
    setFormEmail("");
    setFormRole("EDITOR");
    setFormPassword(generatePassword());
    setFormError(null);
    setModalOpen(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (formPassword.length < 8) {
      setFormError("Das Passwort muss mindestens 8 Zeichen haben.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          email: formEmail.trim(),
          password: formPassword,
          role: formRole,
          isActive: true,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(
          typeof body?.error === "string"
            ? body.error
            : "Benutzer konnte nicht angelegt werden."
        );
        return;
      }
      setModalOpen(false);
      await loadUsers();
    } catch {
      setFormError("Benutzer konnte nicht angelegt werden.");
    } finally {
      setCreating(false);
    }
  }

  async function updateUser(
    id: string,
    payload: { role?: "ADMIN" | "EDITOR"; isActive?: boolean }
  ) {
    setPendingId(id);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...payload }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(
          typeof body?.error === "string"
            ? body.error
            : "Aktualisierung fehlgeschlagen."
        );
        return;
      }
      await loadUsers();
    } catch {
      alert("Aktualisierung fehlgeschlagen.");
    } finally {
      setPendingId(null);
    }
  }

  function handleRoleChange(id: string, role: "ADMIN" | "EDITOR") {
    if (id === currentUserId && role !== "ADMIN") {
      alert("Sie können sich nicht selbst die Admin-Rolle entziehen.");
      return;
    }
    void updateUser(id, { role });
  }

  function handleToggleActive(user: UserRow) {
    if (user.id === currentUserId && user.isActive) {
      alert("Sie können Ihr eigenes Konto nicht deaktivieren.");
      return;
    }
    const action = user.isActive ? "deaktivieren" : "aktivieren";
    const ok = window.confirm(
      `Benutzer „${user.name}“ wirklich ${action}?`
    );
    if (!ok) return;
    void updateUser(user.id, { isActive: !user.isActive });
  }

  function openEditModal(user: UserRow) {
    setEditUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditPassword("");
    setEditBio(user.bio ?? "");
    setEditError(null);
    setEditModalOpen(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editUser) return;
    setEditError(null);

    if (editPassword && editPassword.length < 8) {
      setEditError("Das Passwort muss mindestens 8 Zeichen haben.");
      return;
    }

    const payload: Record<string, unknown> = { id: editUser.id };
    if (editName.trim() !== editUser.name) payload.name = editName.trim();
    if (editEmail.trim() !== editUser.email) payload.email = editEmail.trim();
    if (editRole !== editUser.role) payload.role = editRole;
    if (editPassword) payload.password = editPassword;
    if ((editBio || "") !== (editUser.bio || "")) payload.bio = editBio || null;

    if (Object.keys(payload).length === 1) {
      setEditModalOpen(false);
      return;
    }

    setEditSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setEditError(
          typeof body?.error === "string" ? body.error : "Aktualisierung fehlgeschlagen."
        );
        return;
      }
      setEditModalOpen(false);
      await loadUsers();
    } catch {
      setEditError("Aktualisierung fehlgeschlagen.");
    } finally {
      setEditSaving(false);
    }
  }

  if (sessionStatus === "loading") {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-[#E5E5E5] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#F9F9F9]">
          <ShieldOff className="size-7 text-[#666666]" aria-hidden />
        </div>
        <h1 className="mt-4 font-display text-xl font-bold text-[#111111]">
          Kein Zugriff
        </h1>
        <p className="mt-2 text-sm text-[#666666]">
          Nur Administratoren dürfen Redakteure verwalten.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-lg bg-[#F9F9F9]">
            <Users className="size-6 text-[#E31E24]" aria-hidden />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#111111] md:text-3xl">
              Redakteure
            </h1>
            <p className="text-sm text-[#666666]">
              Benutzerkonten und Rollen verwalten
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="primary"
          size="md"
          className="w-full gap-2 sm:w-auto"
          onClick={openCreateModal}
        >
          <Plus className="size-4 shrink-0" aria-hidden />
          Neuer Redakteur
        </Button>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-[#E5E5E5] bg-white px-6 py-16 text-center shadow-sm">
          <p className="font-display text-lg font-semibold text-[#111111]">
            Keine Benutzer
          </p>
          <p className="mt-2 text-sm text-[#666666]">
            Legen Sie den ersten Redakteur über „Neuer Redakteur“ an.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E5E5E5] bg-white shadow-sm">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#F9F9F9]">
                <th className="font-display px-4 py-3 font-semibold text-[#111111]">
                  Name
                </th>
                <th className="font-display px-4 py-3 font-semibold text-[#111111]">
                  E-Mail
                </th>
                <th className="font-display px-4 py-3 font-semibold text-[#111111]">
                  Rolle
                </th>
                <th className="font-display px-4 py-3 font-semibold text-[#111111]">
                  Status
                </th>
                <th className="font-display px-4 py-3 text-right font-semibold text-[#111111]">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const busy = pendingId === u.id;
                return (
                  <tr
                    key={u.id}
                    className="border-b border-[#E5E5E5] transition-colors last:border-b-0 hover:bg-[#F9F9F9]"
                  >
                    <td className="px-4 py-3 font-medium text-[#111111]">
                      <span className="inline-flex items-center gap-2">
                        {u.isActive ? (
                          <UserCheck
                            className="size-4 shrink-0 text-green-600"
                            aria-hidden
                          />
                        ) : (
                          <UserX
                            className="size-4 shrink-0 text-[#666666]"
                            aria-hidden
                          />
                        )}
                        {u.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#666666]">{u.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={u.role === "ADMIN" ? "danger" : "info"}
                        >
                          {roleLabel(u.role)}
                        </Badge>
                        <span
                          className="inline-flex text-[#666666]"
                          aria-hidden
                          title="Rolle bearbeiten"
                        >
                          <Pencil className="size-4 shrink-0" />
                        </span>
                        <label className="sr-only" htmlFor={`role-${u.id}`}>
                          Rolle ändern für {u.name}
                        </label>
                        <select
                          id={`role-${u.id}`}
                          className={cn(
                            selectClass,
                            "max-w-[160px] py-1.5 text-xs"
                          )}
                          value={u.role}
                          disabled={busy}
                          title="Rolle bearbeiten"
                          onChange={(e) =>
                            handleRoleChange(
                              u.id,
                              e.target.value as "ADMIN" | "EDITOR"
                            )
                          }
                        >
                          <option value="EDITOR">Redakteur</option>
                          <option value="ADMIN">Administrator</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {u.isActive ? (
                        <Badge variant="success">Aktiv</Badge>
                      ) : (
                        <Badge variant="default">Inaktiv</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="gap-1 px-2"
                          disabled={busy}
                          title="Bearbeiten"
                          onClick={() => openEditModal(u)}
                        >
                          <Pencil className="size-4" aria-hidden />
                          <span className="hidden sm:inline">Bearbeiten</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="gap-1 px-2"
                          disabled={busy}
                          title={
                            u.isActive ? "Deaktivieren" : "Aktivieren"
                          }
                          onClick={() => handleToggleActive(u)}
                        >
                          {u.isActive ? (
                            <>
                              <ShieldOff className="size-4" aria-hidden />
                              <span className="hidden sm:inline">
                                Deaktivieren
                              </span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="size-4" aria-hidden />
                              <span className="hidden sm:inline">
                                Aktivieren
                              </span>
                            </>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => !creating && setModalOpen(false)}
        title="Neuer Redakteur"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            id="new-user-name"
            label="Name"
            required
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            autoComplete="name"
          />
          <Input
            id="new-user-email"
            label="E-Mail"
            type="email"
            required
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            autoComplete="email"
          />
          <div>
            <label
              htmlFor="new-user-role"
              className="block text-sm font-display font-semibold text-[#111111] mb-1"
            >
              Rolle
            </label>
            <select
              id="new-user-role"
              className={selectClass}
              value={formRole}
              onChange={(e) =>
                setFormRole(e.target.value as "ADMIN" | "EDITOR")
              }
            >
              <option value="EDITOR">Redakteur</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>
          <div>
            <Input
              id="new-user-password"
              label="Passwort"
              type="password"
              required
              minLength={8}
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              autoComplete="new-password"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-2"
              onClick={() => setFormPassword(generatePassword())}
            >
              Passwort generieren
            </Button>
          </div>
          {formError ? (
            <p className="text-sm text-red-600">{formError}</p>
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              disabled={creating}
              onClick={() => setModalOpen(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit" variant="primary" disabled={creating}>
              {creating ? "Wird angelegt…" : "Anlegen"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={editModalOpen}
        onClose={() => !editSaving && setEditModalOpen(false)}
        title="Benutzer bearbeiten"
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <Input
            id="edit-user-name"
            label="Name"
            required
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            autoComplete="name"
          />
          <Input
            id="edit-user-email"
            label="E-Mail"
            type="email"
            required
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            autoComplete="email"
          />
          <div>
            <label
              htmlFor="edit-user-role"
              className="block text-sm font-display font-semibold text-[#111111] mb-1"
            >
              Rolle
            </label>
            <select
              id="edit-user-role"
              className={selectClass}
              value={editRole}
              onChange={(e) =>
                setEditRole(e.target.value as "ADMIN" | "EDITOR")
              }
            >
              <option value="EDITOR">Redakteur</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>
          <div>
            <Input
              id="edit-user-password"
              label="Neues Passwort (leer = unverändert)"
              type="password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Nur ausfüllen wenn Passwort geändert werden soll"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-2"
              onClick={() => setEditPassword(generatePassword())}
            >
              Passwort generieren
            </Button>
          </div>
          <div>
            <label
              htmlFor="edit-user-bio"
              className="block text-sm font-display font-semibold text-[#111111] mb-1"
            >
              Biografie
            </label>
            <textarea
              id="edit-user-bio"
              className={cn(selectClass, "min-h-[120px] resize-y")}
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder="Kurze Biografie des Redakteurs …"
              rows={5}
            />
          </div>
          {editError ? (
            <p className="text-sm text-red-600">{editError}</p>
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              disabled={editSaving}
              onClick={() => setEditModalOpen(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit" variant="primary" disabled={editSaving}>
              {editSaving ? "Wird gespeichert…" : "Speichern"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
