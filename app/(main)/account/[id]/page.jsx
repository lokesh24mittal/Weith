import { getAccountWithTransactions } from "@/actions/accounts";
import NotFound from "@/app/not-found";
import React from "react";

const AccountsPage = async ({ params }) => {
  const { id } = await params;
  const accountData = await getAccountWithTransactions(id);
  if (!accountData) {
    return NotFound();
  }
  const { transactions, ...account } = accountData;

  return (
    <div className="space-y-8 px-5 flex gap-4 items-end justify-between">
      <div>
        <h1 className="text-5xl sm:text-6xl font-bold gradient-title capatilize">
          {account.name}
        </h1>
        <p className="text-muted-foreground">
          {account.type.charAt(0) + account.type.slice(1).toLowerCase()}
          Account
        </p>
      </div>
      <div className="text-right pb-2">
        <div className="text-xl sm:text-2xl font-bold">
          &#8377;{parseFloat(account.balance).toFixed(2)}
        </div>
        <p className="text-sm text-muted-foreground">
          {account._count.transactions} transactions
        </p>
      </div>

      {/* chart section */}

      {/* transaction table */}
    </div>
  );
};

export default AccountsPage;
