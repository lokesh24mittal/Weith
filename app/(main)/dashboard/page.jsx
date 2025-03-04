import { getUserAccounts } from "@/actions/dashboard";
import CreateAccountDrawer from "@/components/CreateAccountDrawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import React from "react";
import AccountCard from "./_components/account-card";
import { getCurrentBudget } from "@/actions/budget";
import BudgetProgress from "./_components/budget-progress";

const DashboardPage = async () => {
  const accounts = await getUserAccounts();

  const defaulltAccount = accounts?.find((account) => account.isDefault);

  let budgetData = null;

  if (defaulltAccount) {
    budgetData = await getCurrentBudget(defaulltAccount.id);
  }
  return (
    <div className="space-y-8">
      {/* budget progress */}
      {defaulltAccount && (
        <BudgetProgress
          initialBuget={budgetData?.budget}
          currentExpenses={budgetData?.currentExpenses || 0}
        />
      )}

      {/* overview */}

      {/* accounts grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <Card
            className={
              "hover:shadow-md transition-shadow cursor-pointer border-dashed"
            }
          >
            <CardContent
              className={
                "flex flex-col items-center justify-center text-muted-foreground h-full pt-5 "
              }
            >
              <Plus className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Add new Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        {accounts.length > 0 &&
          accounts?.map((account) => {
            return <AccountCard key={account.id} account={account} />;
          })}
      </div>
    </div>
  );
};

export default DashboardPage;
