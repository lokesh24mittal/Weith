"use client";
import { bulkDeleteTransactions } from "@/actions/accounts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { categoryColors } from "@/data/categories";
import useFetch from "@/hooks/use-fetch";
import { format } from "date-fns";
import {
  ArrowBigLeft,
  ArrowBigRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { BarLoader } from "react-spinners";
import { toast } from "sonner";

const TransactionsTable = ({ transactions }) => {
  // for selecting checkbox
  const [selectedIds, setSelectedIds] = useState([]);

  // for sorting the data arrow
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "asc",
  });

  const [searchItem, setSearchItem] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recuringFilter, setRecuringFilter] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);

  //   recuring interval
  const recuringInterval = {
    DAILY: "Daily",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
    YEARLY: "Yearly",
  };

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleted,
  } = useFetch(bulkDeleteTransactions);

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];
    setCurrentPage(1);
    // apply search filter

    if (searchItem) {
      const seacrhLower = searchItem.toLowerCase();
      result = result.filter((transaction) =>
        transaction.description.toLowerCase().includes(seacrhLower)
      );
    }
    if (typeFilter) {
      result = result.filter((transaction) => transaction.type === typeFilter);
    }

    if (recuringFilter) {
      result = result.filter((transaction) => {
        return recuringFilter === "recurring"
          ? transaction.isRecurring
          : !transaction.isRecurring;
      });
    }

    // apply filter

    result.sort((a, b) => {
      let comparison = 0;

      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = 0;
      }
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
    return result;
  }, [transactions, searchItem, typeFilter, recuringFilter, sortConfig]);

  // see arrow ofsort asc dsc
  const handleSort = (field) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction == "asc" ? "dsc" : "asc",
    }));
  };
  // select one content
  const handleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  // select all content
  const handleSelectAll = () => {
    setSelectedIds((current) =>
      current.length === filteredAndSortedTransactions.length
        ? []
        : filteredAndSortedTransactions.map((t) => t.id)
    );
  };

  const router = useRouter();

  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} transactions?`
      )
    ) {
      return;
    }

    deleteFn(selectedIds);
  };

  const handleClickFilter = () => {
    setSearchItem("");
    setTypeFilter("");
    setRecuringFilter("");
    setSelectedIds([]);
  };

  const totalPages = () => {
    const calculatedPages =
      filteredAndSortedTransactions.length <= 10
        ? 1
        : Math.floor(
            filteredAndSortedTransactions.length % 10 === 0
              ? filteredAndSortedTransactions.length / 10
              : filteredAndSortedTransactions.length / 10 + 1
          );
    return calculatedPages;
  };

  useEffect(() => {
    if (deleted && !deleteLoading) {
      toast.success("Transactions deleted Successfully");
    }
  }, [deleted, deleteLoading]);

  return (
    <div className="space-y-4">
      {/* loader */}
      {deleteLoading && (
        <BarLoader className="mt-4" width={"100%"} color="#9333ea" />
      )}
      {/* filters */}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className={"pl-8"}
            value={searchItem}
            onChange={(e) => setSearchItem(e.target.value)}
            placeholder="Search transactions..."
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={recuringFilter}
            onValueChange={(value) => setRecuringFilter(value)}
          >
            <SelectTrigger className={"w-[140px]"}>
              <SelectValue placeholder="All transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recurring">Recurring</SelectItem>
              <SelectItem value="non-recurring">Non recurring only</SelectItem>
            </SelectContent>
          </Select>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant={"destructive"}
                size={"sm"}
                onClick={handleBulkDelete}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete Selected ({selectedIds.length})
              </Button>
            </div>
          )}
          {(searchItem || recuringFilter || typeFilter) && (
            <Button
              variant={"outline"}
              size={"icon"}
              onClick={handleClickFilter}
              title="clear Filters"
            >
              <X className="h-4 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* transactions table */}
      <div className="rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={"w-[50px"}>
                <Checkbox
                  checked={
                    selectedIds.length ===
                      filteredAndSortedTransactions.length &&
                    filteredAndSortedTransactions.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead
                className={"cursor-pointer"}
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  Date
                  {sortConfig.field === "date" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4 " />
                    ))}
                </div>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead
                className={"cursor-pointer"}
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center">
                  Category
                  {sortConfig.field === "category" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4 " />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className={"cursor-pointer"}
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end">
                  Amount
                  {sortConfig.field === "amount" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4 " />
                    ))}
                </div>
              </TableHead>
              <TableHead>Recuring</TableHead>
              <TableHead className={"w-[50px]"}></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className={"text-center text-muted-foreground"}
                >
                  No transactions Found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedTransactions
                .slice(currentPage * 10 - 10, currentPage * 10)
                .map((transaction) => (
                  <TableRow className={""} key={transaction.id}>
                    <TableCell>
                      <Checkbox
                        onCheckedChange={() => handleSelect(transaction.id)}
                        checked={selectedIds.includes(transaction.id)}
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(transaction.date), "PP")}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className={"capitalize"}>
                      <span
                        style={{
                          background: categoryColors[transaction.category],
                        }}
                        className="px-2 py-1 rounded text-white text-sm"
                      >
                        {transaction.category}
                      </span>
                    </TableCell>
                    <TableCell
                      className={"text-right font-medium"}
                      style={{
                        color: transaction.type === "EXPENSE" ? "red" : "green",
                      }}
                    >
                      {transaction.type === "EXPENSE" ? "- " : "+ "}
                      &#8377;{transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {transaction.isRecurring ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge
                                variant={"outline"}
                                className={
                                  "gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200"
                                }
                              >
                                <RefreshCw className="h-3 w-3" />
                                {
                                  recuringInterval[
                                    transaction.recurringInterval
                                  ]
                                }
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-sm">
                                <div className="font-medium">Next Date:</div>
                                <div className="">
                                  {format(
                                    new Date(transaction.nextRecurringDate),
                                    "PP"
                                  )}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <Badge variant={"outline"} className={"gap-1"}>
                          <Clock className="h-3 w-3" />
                          One-time
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant={"ghost"} className={"h-8 w-8 p-0"}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel
                            onClick={() =>
                              router.push(
                                `/transaction/create?edit=${transaction.id}`
                              )
                            }
                            className={
                              "cursor-pointer hover:bg-gray-100 hover:rounded-sm"
                            }
                          >
                            Edit
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className={"text-destructive cursor-pointer"}
                            onClick={() => deleteFn([transaction.id])}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        {/* pagination */}

        <div className="flex items-center justify-center mt-10 gap-2">
          <Button
            disabled={currentPage === 1}
            variant={"outline"}
            size={"icon"}
            className="h-8 w-8 p-0"
            onClick={() =>
              setCurrentPage((prev) => {
                return prev === 1 ? 1 : prev - 1;
              })
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1>
            Page {currentPage} of {totalPages()}
          </h1>
          <Button
            variant={"outline"}
            size={"icon"}
            disabled={totalPages() === currentPage}
            className="h-8 w-8 p-0"
            onClick={() =>
              setCurrentPage((prev) => {
                return prev === filteredAndSortedTransactions.length
                  ? filteredAndSortedTransactions.length
                  : prev + 1;
              })
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransactionsTable;
