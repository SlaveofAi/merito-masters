
import React, { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const DeleteAccount: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) {
      toast.error("Nie je možné odstrániť účet, používateľ nie je prihlásený");
      return;
    }

    setIsDeleting(true);
    try {
      // 1. Delete user profiles data first
      const { error: deleteProfileError } = await supabase
        .from("user_types")
        .delete()
        .eq("user_id", user.id);

      if (deleteProfileError) {
        throw new Error(`Chyba pri mazaní typu používateľa: ${deleteProfileError.message}`);
      }

      // 2. Delete auth user account
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) {
        // If admin delete fails, try regular delete (requires recent login)
        const { error: deleteUserError } = await supabase.rpc('delete_user');
        if (deleteUserError) {
          throw new Error(`Chyba pri mazaní účtu: ${deleteUserError.message}`);
        }
      }

      // 3. Sign out the user
      await signOut();
      
      toast.success("Váš účet bol úspešne odstránený");
      navigate("/", { replace: true });
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error("Nastala chyba pri odstraňovaní účtu", {
        description: error.message
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="border-t border-border/50 mt-8 pt-8">
      <h3 className="text-lg font-medium text-destructive mb-4">Nebezpečná zóna</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Odstránením účtu vymažete všetky vaše údaje, vrátane profilu, správ a hodnotení. Táto akcia je nezvratná.
      </p>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Odstrániť účet
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Naozaj chcete odstrániť svoj účet?</AlertDialogTitle>
            <AlertDialogDescription>
              Táto akcia je nezvratná. Odstráni váš účet a všetky asociované údaje z našej databázy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrušiť</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Odstraňujem..." : "Áno, odstrániť účet"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeleteAccount;
