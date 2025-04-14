import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const usePermissions = () => {
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    // Get permissions from cookies
    const storedPermissions = Cookies.get("permissions");

    if (storedPermissions) {
      try {
        // Decode and parse the permissions from cookies
        const decodedPermissions = JSON.parse(decodeURIComponent(storedPermissions));
        setPermissions(decodedPermissions);
      } catch (error) {
        console.error("Error decoding permissions from cookies:", error);
      }
    }
  }, []);

  // Check if the user has a single permission
  const hasPermission = (permission: string) => permissions.includes(permission);

  // Check if the user has at least one of multiple permissions
  const hasAnyPermission = (...perms: string[]) =>
    perms.some((perm) => permissions.includes(perm));

  return { hasPermission, hasAnyPermission, permissions };
};

export default usePermissions;
