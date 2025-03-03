import { getAccountWithTransactions } from "@/actions/accounts";
import NotFound from "@/app/not-found";
import React, { Suspense } from "react";
import { BarLoader } from "react-spinners";
import TransactionsTable from "../_components/transactions-table";
import AccountChart from "../_components/account-chart";

const AccountsPage = async ({ params }) => {
  const { id } = await params;
  const accountData = await getAccountWithTransactions(id);
  if (!accountData) {
    return NotFound();
  }
  const { transactions, ...account } = accountData;

  return (
    <div className="space-y-8 px-5 ">
      <div className="flex gap-4 items-end justify-between">
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
      </div>

      {/* chart section */}

      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <AccountChart transactions={transactions} />
      </Suspense>

      {/* transaction table */}

      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <TransactionsTable transactions={transactions} />
      </Suspense>
    </div>
  );
};

export default AccountsPage;
