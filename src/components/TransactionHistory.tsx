import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Transaction {
  id: string;
  zone: string;
  investor: string;
  amount: string;
  platformFee: string;
  status: 'Completed' | 'Pending';
}

const iliganTransactions: Transaction[] = [
  {
    id: '1',
    zone: 'Rogongon Cacao Development Zone',
    investor: 'Nestle Philippines',
    amount: 'PHP 42.5M',
    platformFee: 'PHP 1.275M (3%)',
    status: 'Completed'
  },
  {
    id: '2',
    zone: 'Panoroganan Rice Complex',
    investor: 'Iligan LGU Agricultural Program',
    amount: 'PHP 144M',
    platformFee: 'PHP 4.32M (3%)',
    status: 'Pending'
  },
  {
    id: '3',
    zone: 'Mainit Coconut Plantation',
    investor: 'Philippine Coconut Authority',
    amount: 'PHP 56.25M',
    platformFee: 'PHP 1.6875M (3%)',
    status: 'Completed'
  },
  {
    id: '4',
    zone: 'Abuno Banana Production Area',
    investor: 'Del Monte Fresh Produce',
    amount: 'PHP 28.5M',
    platformFee: 'PHP 855K (3%)',
    status: 'Completed'
  },
  {
    id: '5',
    zone: 'Bunawan Corn Development',
    investor: 'Regional Agri Development Corp',
    amount: 'PHP 96M',
    platformFee: 'PHP 2.88M (3%)',
    status: 'Pending'
  },
  {
    id: '6',
    zone: 'Kalilangan Rice Fields',
    investor: 'Mindanao Agricultural Investment',
    amount: 'PHP 108M',
    platformFee: 'PHP 3.24M (3%)',
    status: 'Pending'
  }
];

export const TransactionHistory = () => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Transaction History</h2>
        <p className="text-muted-foreground">
          View all investment transactions and their current status on the platform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Iligan Agricultural Investments</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {iliganTransactions.length} Total
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="gap-1"
              >
                {showDetails ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Less Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show Details
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {iliganTransactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{transaction.zone}</h4>
                      {showDetails && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {transaction.investor}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">{transaction.amount}</div>
                      {showDetails && (
                        <div className="text-xs text-muted-foreground">
                          Fee: {transaction.platformFee}
                        </div>
                      )}
                    </div>
                    <Badge 
                      variant={transaction.status === 'Completed' ? 'default' : 'secondary'}
                      className={`text-xs ${
                        transaction.status === 'Completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                      }`}
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold">PHP 475.25M</p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-green-600">
                  +18.7%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Platform Fees</p>
                <p className="text-2xl font-bold">PHP 14.26M</p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-blue-600">
                  3% avg
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-purple-600">
                  50% rate
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionHistory;
