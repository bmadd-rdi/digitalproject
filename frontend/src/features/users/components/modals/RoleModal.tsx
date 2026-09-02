"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useRoles } from "@/features/lookups/hooks/useLookups";
import { User } from "../../types";

interface RoleOption {
  id: number;
  name: string;
}

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (roleIds: number[]) => Promise<void>;
  isSaving?: boolean;
}

const formatRoleName = (name: string) =>
  name.toLowerCase().split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");

export const RoleModal = ({ isOpen, onClose, user, onSave, isSaving = false }: RoleModalProps) => {
  const { data, isLoading } = useRoles();
  const roles = useMemo(() => (data?.data ?? []) as RoleOption[], [data?.data]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>(() => user?.role_ids ?? []);

  const handleRoleToggle = (roleId: number, checked: boolean) => {
    setSelectedRoles((current) => checked
      ? [...new Set([...current, roleId])]
      : current.filter((id) => id !== roleId));
  };

  const handleSave = async () => {
    if (selectedRoles.length === 0) return;
    await onSave(selectedRoles);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>ปรับเปลี่ยนสิทธิ์ผู้ใช้งาน</DialogTitle>
          <DialogDescription>
            ผู้ใช้: <span className="font-bold text-slate-900">{user?.first_name} {user?.last_name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <label className="text-sm font-bold text-slate-700">กำหนดบทบาท (เลือกได้หลายรายการ)</label>
          <div className="border border-border rounded-lg p-1 bg-slate-50/50">
            {isLoading ? (
              <p className="p-3 text-sm text-muted-foreground">Loading roles...</p>
            ) : roles.length === 0 ? (
              <p className="p-3 text-sm text-muted-foreground">No roles available</p>
            ) : roles.map((role) => (
              <label key={role.id} className="flex items-center gap-3 p-3 hover:bg-slate-100 rounded-md cursor-pointer">
                <Checkbox
                  checked={selectedRoles.includes(role.id)}
                  onCheckedChange={(checked) => handleRoleToggle(role.id, checked === true)}
                  disabled={isSaving}
                />
                <span className="text-sm font-bold text-slate-800">{formatRoleName(role.name)}</span>
              </label>
            ))}
          </div>
          {selectedRoles.length === 0 && (
            <p className="text-xs text-destructive">At least one role is required.</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>ยกเลิก</Button>
          <Button onClick={handleSave} disabled={isSaving || selectedRoles.length === 0} className="gap-2">
            <Check className="w-4 h-4" /> {isSaving ? "กำลังบันทึก..." : "บันทึกสิทธิ์"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
