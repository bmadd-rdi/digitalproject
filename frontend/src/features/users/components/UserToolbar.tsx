import { Search, Shield, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDepartments, useRoles } from "@/features/lookups/hooks/useLookups";

interface UserToolbarProps {
  search: string;
  setSearch: (value: string) => void;
  deptFilter: string;
  setDeptFilter: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  activeOnly: boolean;
  setActiveOnly: (value: boolean) => void;
}

interface LookupOption {
  id: number;
  name: string;
}

const formatRoleName = (name: string) =>
  name
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const UserToolbar = ({
  search,
  setSearch,
  deptFilter,
  setDeptFilter,
  roleFilter,
  setRoleFilter,
  activeOnly,
  setActiveOnly,
}: UserToolbarProps) => {
  const { data: departmentsResponse, isLoading: isDepartmentsLoading } = useDepartments();
  const { data: rolesResponse, isLoading: isRolesLoading } = useRoles();
  const departments = (departmentsResponse?.data ?? []) as LookupOption[];
  const roles = (rolesResponse?.data ?? []) as LookupOption[];

  return (
    <div className="bg-white p-4 rounded-md border border-border shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, username, or email..."
            className="pl-9 bg-slate-50/50"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-full sm:w-55 bg-slate-50/50">
            <Building2 className="w-4 h-4 text-slate-400 mr-2" />
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All departments</SelectItem>
            {isDepartmentsLoading ? (
              <SelectItem value="__loading_departments" disabled>
                Loading departments...
              </SelectItem>
            ) : departments.length === 0 ? (
              <SelectItem value="__empty_departments" disabled>
                No departments available
              </SelectItem>
            ) : (
              departments.map((department) => (
                <SelectItem key={department.id} value={department.name}>
                  {department.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-slate-50/50">
            <Shield className="w-4 h-4 text-slate-400 mr-2" />
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All roles</SelectItem>
            {isRolesLoading ? (
              <SelectItem value="__loading_roles" disabled>
                Loading roles...
              </SelectItem>
            ) : roles.length === 0 ? (
              <SelectItem value="__empty_roles" disabled>
                No roles available
              </SelectItem>
            ) : (
              roles.map((role) => (
                <SelectItem key={role.id} value={role.name}>
                  {formatRoleName(role.name)}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-dashed border-border shrink-0">
        <Switch id="active-filter" checked={activeOnly} onCheckedChange={setActiveOnly} />
        <Label htmlFor="active-filter" className="text-sm font-medium text-slate-600 cursor-pointer select-none">
          Active users only
        </Label>
      </div>
    </div>
  );
};
