import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { FinancialEntry, FinancialSummary } from '@/types/financialTypes';
import { Plus, DollarSign, TrendingUp, Calculator, FileText } from 'lucide-react';
import { Farm } from '@/types/farmTypes';
import { formatCurrency, generateFinancialPDF } from '@/utils/pdfUtils';

interface FinancialToolsProps {
  farms: Farm[];
  financialData: FinancialEntry[];
  setFinancialData: React.Dispatch<React.SetStateAction<FinancialEntry[]>>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const FinancialTools: React.FC<FinancialToolsProps> = ({ farms, financialData, setFinancialData }) => {
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [newEntry, setNewEntry] = useState<Omit<FinancialEntry, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    category: 'expense',
    type: '',
    amount: 0,
    description: '',
    farmId: farms.length > 0 ? farms[0].id : 0
  });
  
  const [isShowingROI, setIsShowingROI] = useState(false);
  const [roiInputs, setRoiInputs] = useState({
    initialInvestment: 10000,
    estimatedReturn: 12000,
    timeframeMonths: 12
  });

  const financialSummary: FinancialSummary = useMemo(() => {
    const totalIncome = financialData
      .filter(entry => entry.category === 'income')
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    const totalExpenses = financialData
      .filter(entry => entry.category === 'expense')
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    const expenseByCategory: Record<string, number> = {};
    const incomeByCategory: Record<string, number> = {};
    
    financialData.forEach(entry => {
      if (entry.category === 'expense') {
        expenseByCategory[entry.type] = (expenseByCategory[entry.type] || 0) + entry.amount;
      } else {
        incomeByCategory[entry.type] = (incomeByCategory[entry.type] || 0) + entry.amount;
      }
    });

    // Create farm summaries
    const farmSummaries = farms.map(farm => {
      const farmEntries = financialData.filter(entry => entry.farmId === farm.id);
      const farmIncome = farmEntries
        .filter(entry => entry.category === 'income')
        .reduce((sum, entry) => sum + entry.amount, 0);
      
      const farmExpenses = farmEntries
        .filter(entry => entry.category === 'expense')
        .reduce((sum, entry) => sum + entry.amount, 0);
      
      return {
        farmId: farm.id,
        farmName: farm.name,
        income: farmIncome,
        expenses: farmExpenses,
        profit: farmIncome - farmExpenses
      };
    });

    // Create monthly data
    const monthlyData = Array(12).fill(0).map((_, month) => {
      const monthEntries = financialData.filter(entry => 
        new Date(entry.date).getMonth() === month
      );
      
      const monthIncome = monthEntries
        .filter(entry => entry.category === 'income')
        .reduce((sum, entry) => sum + entry.amount, 0);
      
      const monthExpenses = monthEntries
        .filter(entry => entry.category === 'expense')
        .reduce((sum, entry) => sum + entry.amount, 0);
      
      return {
        month,
        income: monthIncome,
        expenses: monthExpenses,
        profit: monthIncome - monthExpenses
      };
    });
    
    // Convert expense and income categories to pie data
    const expensePieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));
    const incomePieData = Object.entries(incomeByCategory).map(([name, value]) => ({ name, value }));
    
    return {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      roi: totalExpenses > 0 ? ((totalIncome - totalExpenses) / totalExpenses) * 100 : 0,
      farmSummaries,
      monthlyData,
      incomePieData,
      expensePieData,
      updatedGoals: [] // Will be populated elsewhere
    };
  }, [financialData, farms]);
  
  const expensePieData = useMemo(() => {
    return financialSummary.expensePieData;
  }, [financialSummary]);
  
  const incomePieData = useMemo(() => {
    return financialSummary.incomePieData;
  }, [financialSummary]);

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    setFinancialData([...financialData, {
      id: Date.now(),
      ...newEntry,
      amount: Number(newEntry.amount)
    }]);
    setIsAddingEntry(false);
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      category: 'expense',
      type: '',
      amount: 0,
      description: '',
      farmId: farms.length > 0 ? farms[0].id : 0
    });
  };

  const calculateROI = () => {
    const { initialInvestment, estimatedReturn, timeframeMonths } = roiInputs;
    const profit = estimatedReturn - initialInvestment;
    const roi = (profit / initialInvestment) * 100;
    const annualizedROI = roi * (12 / timeframeMonths);
    
    return {
      profit,
      roi,
      annualizedROI
    };
  };

  const roiResults = calculateROI();

  const handleExportFinancialPDF = () => {
    generateFinancialPDF(farms, financialData, 'All Time');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Financial Management</h2>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddingEntry(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
          <Button variant="outline" onClick={() => setIsShowingROI(true)}>
            <Calculator className="h-4 w-4 mr-2" />
            ROI Calculator
          </Button>
          <Button variant="outline" onClick={handleExportFinancialPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50">
          <CardContent className="flex flex-col items-center justify-center py-6">
            <DollarSign className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-sm text-gray-500">Total Income</p>
            <p className="text-3xl font-bold text-green-700">
              {formatCurrency(financialSummary.totalIncome)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-6">
            <DollarSign className="h-8 w-8 text-red-600 mb-2" />
            <p className="text-sm text-gray-500">Total Expenses</p>
            <p className="text-3xl font-bold text-red-700">
              {formatCurrency(financialSummary.totalExpenses)}
            </p>
          </CardContent>
        </Card>
        <Card className={financialSummary.netProfit >= 0 ? "bg-blue-50" : "bg-amber-50"}>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <TrendingUp className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-sm text-gray-500">Net Profit</p>
            <p className={`text-3xl font-bold ${financialSummary.netProfit >= 0 ? "text-blue-700" : "text-amber-700"}`}>
              {formatCurrency(financialSummary.netProfit)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="breakdown">
        <TabsList>
          <TabsTrigger value="breakdown">Financial Breakdown</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="breakdown">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {expensePieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expensePieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {expensePieData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">No expense data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Income Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {incomePieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={incomePieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {incomePieData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">No income data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Monthly Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={createMonthlyData(financialData)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Bar dataKey="income" stackId="a" fill="#82ca9d" name="Income" />
                      <Bar dataKey="expenses" stackId="a" fill="#ff7675" name="Expenses" />
                      <Bar dataKey="profit" fill="#74b9ff" name="Profit" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {financialData.length > 0 ? (
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3">Date</th>
                        <th scope="col" className="px-6 py-3">Type</th>
                        <th scope="col" className="px-6 py-3">Category</th>
                        <th scope="col" className="px-6 py-3">Farm</th>
                        <th scope="col" className="px-6 py-3">Amount</th>
                        <th scope="col" className="px-6 py-3">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financialData
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(entry => (
                        <tr key={entry.id} className="bg-white border-b">
                          <td className="px-6 py-4">{new Date(entry.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4">{entry.type}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              entry.category === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {entry.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {farms.find(farm => farm.id === entry.farmId)?.name || 'Unknown'}
                          </td>
                          <td className={`px-6 py-4 font-medium ${
                            entry.category === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(entry.amount)}
                          </td>
                          <td className="px-6 py-4">{entry.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No transactions recorded yet.</p>
                  <Button variant="outline" className="mt-4" onClick={() => setIsAddingEntry(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEntry} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="transaction-date">Date</Label>
                <Input
                  id="transaction-date"
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="transaction-category">Category</Label>
                <select
                  id="transaction-category" 
                  className="w-full p-2 border rounded"
                  value={newEntry.category}
                  onChange={(e) => setNewEntry({...newEntry, category: e.target.value as 'income' | 'expense'})}
                  required
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="transaction-type">Type</Label>
              <Input
                id="transaction-type"
                placeholder={newEntry.category === 'income' ? "e.g., Crop Sale, Subsidies" : "e.g., Seeds, Equipment, Labor"}
                value={newEntry.type}
                onChange={(e) => setNewEntry({...newEntry, type: e.target.value})}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="transaction-farm">Farm</Label>
                <select
                  id="transaction-farm" 
                  className="w-full p-2 border rounded"
                  value={newEntry.farmId}
                  onChange={(e) => setNewEntry({...newEntry, farmId: Number(e.target.value)})}
                  required
                >
                  {farms.map(farm => (
                    <option key={farm.id} value={farm.id}>{farm.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="transaction-amount">Amount ($)</Label>
                <Input
                  id="transaction-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newEntry.amount}
                  onChange={(e) => setNewEntry({...newEntry, amount: parseFloat(e.target.value)})}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="transaction-desc">Description</Label>
              <Input
                id="transaction-desc"
                placeholder="Brief description of the transaction"
                value={newEntry.description}
                onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
              />
            </div>
            <Button type="submit" className="w-full">
              Save Transaction
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isShowingROI} onOpenChange={setIsShowingROI}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ROI Calculator</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="initial-investment">Initial Investment ($)</Label>
              <Input
                id="initial-investment"
                type="number"
                min="0"
                value={roiInputs.initialInvestment}
                onChange={(e) => setRoiInputs({...roiInputs, initialInvestment: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="estimated-return">Estimated Return ($)</Label>
              <Input
                id="estimated-return"
                type="number"
                min="0"
                value={roiInputs.estimatedReturn}
                onChange={(e) => setRoiInputs({...roiInputs, estimatedReturn: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="timeframe-months">Timeframe (months)</Label>
              <Input
                id="timeframe-months"
                type="number"
                min="1"
                max="120"
                value={roiInputs.timeframeMonths}
                onChange={(e) => setRoiInputs({...roiInputs, timeframeMonths: parseFloat(e.target.value)})}
              />
            </div>
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Profit</p>
                  <p className="text-xl font-medium">{formatCurrency(roiResults.profit)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ROI</p>
                  <p className="text-xl font-medium">{roiResults.roi.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Annualized ROI</p>
                  <p className="text-xl font-medium">{roiResults.annualizedROI.toFixed(2)}%</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const createMonthlyData = (financialData: FinancialEntry[]) => {
  const monthlyData: Record<string, { month: string; income: number; expenses: number; profit: number }> = {};
  
  financialData.forEach(entry => {
    const date = new Date(entry.date);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = {
        month: new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        income: 0,
        expenses: 0,
        profit: 0
      };
    }
    
    if (entry.category === 'income') {
      monthlyData[monthYear].income += entry.amount;
    } else {
      monthlyData[monthYear].expenses += entry.amount;
    }
    
    monthlyData[monthYear].profit = monthlyData[monthYear].income - monthlyData[monthYear].expenses;
  });
  
  return Object.values(monthlyData).sort((a, b) => {
    const monthA = new Date(a.month).getTime();
    const monthB = new Date(b.month).getTime();
    return monthA - monthB;
  });
};

export default FinancialTools;