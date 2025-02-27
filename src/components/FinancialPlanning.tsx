import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Farm } from '@/types/farmTypes';
import { FinancialEntry, FinancialGoal, FinancialProjection } from '@/types/financialTypes';
import { formatCurrency } from '@/utils/pdfUtils';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { Calendar, DollarSign, Calculator, TrendingUp, PieChart as PieChartIcon, Plus, Clock, Target, FilePlus, Trash } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#a569bd', '#f39c12', '#e74c3c', '#3498db'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface FinancialPlanningProps {
  farms: Farm[];
  financialData: FinancialEntry[];
}

const FinancialPlanning: React.FC<FinancialPlanningProps> = ({ farms, financialData }) => {
  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    const savedGoals = localStorage.getItem('financialGoals');
    return savedGoals ? JSON.parse(savedGoals) : [
      { id: 1, title: 'Annual Revenue Target', amount: 120000, deadline: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0], progress: 0 },
      { id: 2, title: 'Reduce Input Costs', amount: 25000, deadline: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0], progress: 0 },
      { id: 3, title: 'Equipment Purchase Fund', amount: 50000, deadline: new Date(new Date().getFullYear() + 1, 5, 30).toISOString().split('T')[0], progress: 0 }
    ];
  });

  const [projections, setProjections] = useState<FinancialProjection[]>(() => {
    const savedProjections = localStorage.getItem('financialProjections');
    return savedProjections ? JSON.parse(savedProjections) : [];
  });

  const [budgets, setBudgets] = useState<Record<string, number>>(() => {
    const savedBudgets = localStorage.getItem('financialBudgets');
    return savedBudgets ? JSON.parse(savedBudgets) : {
      "Seeds": 12000,
      "Fertilizer": 15000,
      "Pesticides": 8000,
      "Irrigation": 5000,
      "Labor": 25000,
      "Equipment": 30000,
      "Fuel": 10000,
      "Insurance": 5000,
      "Taxes": 8000,
      "Miscellaneous": 5000
    };
  });

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isAddingProjection, setIsAddingProjection] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  
  const [newGoal, setNewGoal] = useState<Omit<FinancialGoal, 'id'>>({
    title: '',
    amount: 0,
    deadline: new Date().toISOString().split('T')[0],
    progress: 0
  });
  
  const [newProjection, setNewProjection] = useState<Omit<FinancialProjection, 'id'>>({
    scenario: '',
    description: '',
    year: new Date().getFullYear(),
    monthlyData: Array(12).fill(0).map((_, i) => ({ 
      month: i, 
      income: 0, 
      expenses: 0,
      profit: 0 
    }))
  });

  const [selectedBudgetCategory, setSelectedBudgetCategory] = useState<string | null>(null);
  const [budgetAmount, setBudgetAmount] = useState<number>(0);

  React.useEffect(() => {
    localStorage.setItem('financialGoals', JSON.stringify(goals));
  }, [goals]);

  React.useEffect(() => {
    localStorage.setItem('financialProjections', JSON.stringify(projections));
  }, [projections]);

  React.useEffect(() => {
    localStorage.setItem('financialBudgets', JSON.stringify(budgets));
  }, [budgets]);

  // Calculate yearly summary
  const yearSummary = useMemo(() => {
    const yearData = financialData.filter(entry => {
      const entryYear = new Date(entry.date).getFullYear();
      return entryYear === selectedYear;
    });

    const totalIncome = yearData
      .filter(entry => entry.category === 'income')
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    const totalExpenses = yearData
      .filter(entry => entry.category === 'expense')
      .reduce((sum, entry) => sum + entry.amount, 0);

    const netProfit = totalIncome - totalExpenses;

    // Calculate by farm
    const farmSummaries = farms.map(farm => {
      const farmEntries = yearData.filter(entry => entry.farmId === farm.id);
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

    // Calculate by month
    const monthlyData = Array(12).fill(0).map((_, month) => {
      const monthEntries = yearData.filter(entry => new Date(entry.date).getMonth() === month);
      
      const monthIncome = monthEntries
        .filter(entry => entry.category === 'income')
        .reduce((sum, entry) => sum + entry.amount, 0);
      
      const monthExpenses = monthEntries
        .filter(entry => entry.category === 'expense')
        .reduce((sum, entry) => sum + entry.amount, 0);
      
      return {
        month: MONTHS[month],
        income: monthIncome,
        expenses: monthExpenses,
        profit: monthIncome - monthExpenses
      };
    });

    // Calculate by category
    const incomeByCategory: Record<string, number> = {};
    const expensesByCategory: Record<string, number> = {};

    yearData.forEach(entry => {
      if (entry.category === 'income') {
        incomeByCategory[entry.type] = (incomeByCategory[entry.type] || 0) + entry.amount;
      } else {
        expensesByCategory[entry.type] = (expensesByCategory[entry.type] || 0) + entry.amount;
      }
    });

    const incomePieData = Object.entries(incomeByCategory).map(([name, value]) => ({ name, value }));
    const expensePieData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));

    // Calculate ROI
    const roi = totalExpenses > 0 ? ((totalIncome - totalExpenses) / totalExpenses) * 100 : 0;

    // Update financial goals progress
    const updatedGoals = goals.map(goal => {
      // Check if goal deadline is within selected year
      const goalYear = new Date(goal.deadline).getFullYear();
      if (goalYear === selectedYear) {
        if (goal.title.toLowerCase().includes('revenue') || goal.title.toLowerCase().includes('income')) {
          return { ...goal, progress: Math.min(100, (totalIncome / goal.amount) * 100) };
        } else if (goal.title.toLowerCase().includes('cost') || goal.title.toLowerCase().includes('expense')) {
          const targetReduction = goal.amount;
          const costSavings = Math.max(0, targetReduction - totalExpenses);
          return { ...goal, progress: Math.min(100, (costSavings / targetReduction) * 100) };
        } else {
          // For other goals, assume they're savings goals
          const targetSavings = goal.amount;
          return { ...goal, progress: Math.min(100, (netProfit / targetSavings) * 100) };
        }
      }
      return goal;
    });

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      roi,
      farmSummaries,
      monthlyData,
      incomePieData,
      expensePieData,
      updatedGoals  // Return the updatedGoals to use in a separate useEffect
    };
  }, [financialData, selectedYear, farms, goals]);

  // Add a separate useEffect to handle the goals update
  React.useEffect(() => {
    if (yearSummary.updatedGoals) {
      setGoals(yearSummary.updatedGoals);
    }
  }, [yearSummary.updatedGoals]);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    setGoals([...goals, { ...newGoal, id: Date.now() }]);
    setIsAddingGoal(false);
    setNewGoal({
      title: '',
      amount: 0,
      deadline: new Date().toISOString().split('T')[0],
      progress: 0
    });
  };

  const handleDeleteGoal = (id: number) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const handleAddProjection = (e: React.FormEvent) => {
    e.preventDefault();
    setProjections([...projections, { ...newProjection, id: Date.now() }]);
    setIsAddingProjection(false);
    setNewProjection({
      scenario: '',
      description: '',
      year: new Date().getFullYear(),
      monthlyData: Array(12).fill(0).map((_, i) => ({ 
        month: i, 
        income: 0, 
        expenses: 0,
        profit: 0 
      }))
    });
  };

  const handleDeleteProjection = (id: number) => {
    setProjections(projections.filter(projection => projection.id !== id));
  };

  const handleUpdateBudget = () => {
    if (selectedBudgetCategory && budgetAmount >= 0) {
      setBudgets({
        ...budgets,
        [selectedBudgetCategory]: budgetAmount
      });
      setIsEditingBudget(false);
      setSelectedBudgetCategory(null);
      setBudgetAmount(0);
    }
  };

  const handleAddBudgetCategory = () => {
    if (selectedBudgetCategory && !Object.keys(budgets).includes(selectedBudgetCategory)) {
      setBudgets({
        ...budgets,
        [selectedBudgetCategory]: budgetAmount
      });
      setIsEditingBudget(false);
      setSelectedBudgetCategory(null);
      setBudgetAmount(0);
    }
  };

  const calculateBudgetProgress = (category: string): number => {
    const budget = budgets[category] || 0;
    const spent = financialData
      .filter(entry => 
        entry.category === 'expense' && 
        entry.type === category && 
        new Date(entry.date).getFullYear() === selectedYear
      )
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    return budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  };

  const calculateTotalBudget = (): number => {
    return Object.values(budgets).reduce((sum, budget) => sum + budget, 0);
  };

  const calculateTotalSpent = (): number => {
    const yearExpenses = financialData
      .filter(entry => 
        entry.category === 'expense' && 
        new Date(entry.date).getFullYear() === selectedYear
      );
    
    return yearExpenses.reduce((sum, entry) => sum + entry.amount, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">Financial Planning & Analysis</h2>
        <div className="flex gap-4 items-center">
          <Select 
            value={selectedYear.toString()} 
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="flex flex-col items-center justify-center py-6">
            <DollarSign className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-sm text-gray-500">Annual Revenue</p>
            <p className="text-3xl font-bold text-green-700">
              {formatCurrency(yearSummary.totalIncome)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="flex flex-col items-center justify-center py-6">
            <DollarSign className="h-8 w-8 text-red-600 mb-2" />
            <p className="text-sm text-gray-500">Annual Expenses</p>
            <p className="text-3xl font-bold text-red-700">
              {formatCurrency(yearSummary.totalExpenses)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="flex flex-col items-center justify-center py-6">
            <Calculator className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-sm text-gray-500">Net Profit</p>
            <p className={`text-3xl font-bold ${yearSummary.netProfit >= 0 ? "text-blue-700" : "text-amber-700"}`}>
              {formatCurrency(yearSummary.netProfit)}
            </p>
            <p className="text-sm mt-1">
              ROI: <span className={yearSummary.roi >= 0 ? "text-green-600" : "text-red-600"}>
                {yearSummary.roi.toFixed(2)}%
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">Financial Summary</TabsTrigger>
          <TabsTrigger value="goals">Financial Goals</TabsTrigger>
          <TabsTrigger value="budget">Budget Planning</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Monthly Performance ({selectedYear})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yearSummary.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Bar dataKey="income" fill="#4ade80" name="Income" />
                      <Bar dataKey="expenses" fill="#f87171" name="Expenses" />
                      <Bar dataKey="profit" fill="#60a5fa" name="Profit" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={yearSummary.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Area type="monotone" dataKey="income" stackId="1" stroke="#4ade80" fill="#4ade8080" name="Income" />
                      <Area type="monotone" dataKey="expenses" stackId="2" stroke="#f87171" fill="#f8717180" name="Expenses" />
                      <Area type="monotone" dataKey="profit" stroke="#60a5fa" fill="#60a5fa80" name="Profit" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Income Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {yearSummary.incomePieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={yearSummary.incomePieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {yearSummary.incomePieData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">No income data available for {selectedYear}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Expense Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {yearSummary.expensePieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={yearSummary.expensePieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {yearSummary.expensePieData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">No expense data available for {selectedYear}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Farm Financial Performance</CardTitle>
                <CardDescription>Comparing financial performance across farms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={yearSummary.farmSummaries}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="farmName" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Bar dataKey="income" name="Revenue" fill="#4ade80" />
                      <Bar dataKey="expenses" name="Expenses" fill="#f87171" />
                      <Bar dataKey="profit" name="Profit" fill="#60a5fa" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="goals">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Financial Goals</h3>
              <Button onClick={() => setIsAddingGoal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {goals.length > 0 ? (
                goals.map(goal => (
                  <Card key={goal.id}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-start">
                        <span className="text-lg">{goal.title}</span>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteGoal(goal.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Deadline: {new Date(goal.deadline).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold mb-2">{formatCurrency(goal.amount)}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress:</span>
                          <span className="font-medium">{goal.progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              goal.progress >= 100 ? 'bg-green-600' : 
                              goal.progress >= 75 ? 'bg-green-400' : 
                              goal.progress >= 50 ? 'bg-yellow-400' : 
                              goal.progress >= 25 ? 'bg-orange-400' : 
                              'bg-red-400'
                            }`}
                            style={{ width: `${goal.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 text-center py-10 border border-dashed rounded-lg">
                  <Target className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">No financial goals set yet.</p>
                  <Button onClick={() => setIsAddingGoal(true)} variant="outline" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Set Your First Goal
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Financial Goal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddGoal} className="space-y-4">
                <div>
                  <Label>Goal Title</Label>
                  <Input 
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                    placeholder="e.g., Annual Revenue Target"
                    required
                  />
                </div>
                <div>
                  <Label>Target Amount ($)</Label>
                  <Input 
                    type="number"
                    min="0"
                    step="0.01"
                    value={newGoal.amount}
                    onChange={(e) => setNewGoal({...newGoal, amount: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label>Deadline</Label>
                  <Input 
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Add Goal
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        <TabsContent value="budget">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Budget Planning</h3>
              <Button onClick={() => setIsEditingBudget(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Update Budget
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Annual Budget Overview</CardTitle>
                  <CardDescription>
                    Total Budget: {formatCurrency(calculateTotalBudget())} | 
                    Spent: {formatCurrency(calculateTotalSpent())} |
                    Remaining: {formatCurrency(calculateTotalBudget() - calculateTotalSpent())}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="space-y-4">
                    {Object.entries(budgets).map(([category, amount]) => {
                      const spent = financialData
                        .filter(entry => 
                          entry.category === 'expense' && 
                          entry.type === category && 
                          new Date(entry.date).getFullYear() === selectedYear
                        )
                        .reduce((sum, entry) => sum + entry.amount, 0);
                      
                      const remaining = amount - spent;
                      const progressPercentage = calculateBudgetProgress(category);
                      
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{category}</span>
                            <span className="text-sm">
                              {formatCurrency(spent)} / {formatCurrency(amount)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${
                                progressPercentage > 100 ? 'bg-red-600' : 
                                progressPercentage >= 85 ? 'bg-orange-400' : 
                                'bg-blue-600'
                              }`}
                              style={{ width: `${Math.min(100, progressPercentage)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Remaining: {formatCurrency(remaining)}</span>
                            <span>{progressPercentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Budget vs Actual</CardTitle>
                  <CardDescription>
                    Comparing budgeted amounts with actual spending
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(budgets).map(([category, amount]) => {
                          const spent = financialData
                            .filter(entry => 
                              entry.category === 'expense' && 
                              entry.type === category && 
                              new Date(entry.date).getFullYear() === selectedYear
                            )
                            .reduce((sum, entry) => sum + entry.amount, 0);
                          
                          return {
                            category,
                            budget: amount,
                            spent,
                            remaining: Math.max(0, amount - spent)
                          };
                        })}
                        margin={{ top: 20, right: 30, left: 20, bottom: 65 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="category" 
                          angle={-45} 
                          textAnchor="end"
                          height={70}
                          interval={0}
                        />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                        <Bar dataKey="budget" fill="#8884d8" name="Budget" />
                        <Bar dataKey="spent" fill="#82ca9d" name="Actual" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="projections">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Financial Projections</h3>
              <Button onClick={() => setIsAddingProjection(true)}>
                <FilePlus className="h-4 w-4 mr-2" />
                New Projection
              </Button>
            </div>
            
            {projections.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {projections.map((projection) => (
                  <Card key={projection.id}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-start">
                        <div>
                          {projection.scenario}
                          <span className="text-sm ml-2 font-normal text-gray-500">
                            (Year: {projection.year})
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteProjection(projection.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                      <CardDescription>{projection.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={projection.monthlyData.map((data, idx) => ({
                              monthName: MONTHS[idx],
                              ...data
                            }))}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="monthName" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                            <Legend />
                            <Line type="monotone" dataKey="income" stroke="#4ade80" name="Projected Income" />
                            <Line type="monotone" dataKey="expenses" stroke="#f87171" name="Projected Expenses" />
                            <Line type="monotone" dataKey="profit" stroke="#60a5fa" name="Projected Profit" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="mt-6 grid grid-cols-3 gap-4">
                        <div className="p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-gray-500">Total Projected Income</p>
                          <p className="text-2xl font-bold text-green-700">
                            {formatCurrency(projection.monthlyData.reduce((sum, month) => sum + month.income, 0))}
                          </p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg">
                          <p className="text-sm text-gray-500">Total Projected Expenses</p>
                          <p className="text-2xl font-bold text-red-700">
                            {formatCurrency(projection.monthlyData.reduce((sum, month) => sum + month.expenses, 0))}
                          </p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-500">Total Projected Profit</p>
                          <p className="text-2xl font-bold text-blue-700">
                            {formatCurrency(projection.monthlyData.reduce((sum, month) => sum + month.profit, 0))}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed rounded-lg">
                <FilePlus className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">No financial projections created yet.</p>
                <Button onClick={() => setIsAddingProjection(true)} variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Projection
                </Button>
              </div>
            )}
          </div>
          
          <Dialog open={isAddingProjection} onOpenChange={setIsAddingProjection}>
            <DialogContent className="max-w-5xl">
              <DialogHeader>
                <DialogTitle>Create Financial Projection</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddProjection} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Scenario Name</Label>
                    <Input 
                      value={newProjection.scenario}
                      onChange={(e) => setNewProjection({...newProjection, scenario: e.target.value})}
                      placeholder="e.g., Optimistic Growth Scenario"
                      required
                    />
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input 
                      type="number"
                      min={new Date().getFullYear()}
                      max={new Date().getFullYear() + 10}
                      value={newProjection.year}
                      onChange={(e) => setNewProjection({...newProjection, year: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Input 
                    value={newProjection.description}
                    onChange={(e) => setNewProjection({...newProjection, description: e.target.value})}
                    placeholder="Brief description of this financial scenario"
                  />
                </div>
                
                <div>
                  <Label className="mb-2 block">Monthly Projections</Label>
                  <div className="overflow-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-2 border text-left">Month</th>
                          <th className="p-2 border text-left">Income ($)</th>
                          <th className="p-2 border text-left">Expenses ($)</th>
                          <th className="p-2 border text-left">Profit ($)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {newProjection.monthlyData.map((month, idx) => (
                          <tr key={idx}>
                            <td className="p-2 border">{MONTHS[idx]}</td>
                            <td className="p-2 border">
                              <Input 
                                type="number"
                                min="0"
                                step="0.01"
                                value={month.income}
                                onChange={(e) => {
                                  const income = parseFloat(e.target.value);
                                  const updatedData = [...newProjection.monthlyData];
                                  updatedData[idx] = {
                                    ...updatedData[idx],
                                    income,
                                    profit: income - month.expenses
                                  };
                                  setNewProjection({...newProjection, monthlyData: updatedData});
                                }}
                                className="border rounded px-2 py-1 w-full"
                              />
                            </td>
                            <td className="p-2 border">
                              <Input 
                                type="number"
                                min="0"
                                step="0.01"
                                value={month.expenses}
                                onChange={(e) => {
                                  const expenses = parseFloat(e.target.value);
                                  const updatedData = [...newProjection.monthlyData];
                                  updatedData[idx] = {
                                    ...updatedData[idx],
                                    expenses,
                                    profit: month.income - expenses
                                  };
                                  setNewProjection({...newProjection, monthlyData: updatedData});
                                }}
                                className="border rounded px-2 py-1 w-full"
                              />
                            </td>
                            <td className="p-2 border">
                              {formatCurrency(month.income - month.expenses)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 font-medium">
                        <tr>
                          <td className="p-2 border">Total</td>
                          <td className="p-2 border">
                            {formatCurrency(newProjection.monthlyData.reduce((sum, month) => sum + month.income, 0))}
                          </td>
                          <td className="p-2 border">
                            {formatCurrency(newProjection.monthlyData.reduce((sum, month) => sum + month.expenses, 0))}
                          </td>
                          <td className="p-2 border">
                            {formatCurrency(newProjection.monthlyData.reduce((sum, month) => sum + month.income - month.expenses, 0))}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                
                <Button type="submit" className="w-full">
                  Create Projection
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isEditingBudget} onOpenChange={setIsEditingBudget}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category</Label>
              <select 
                className="w-full p-2 border rounded"
                value={selectedBudgetCategory || ''}
                onChange={(e) => setSelectedBudgetCategory(e.target.value || null)}
              >
                <option value="">Select Category</option>
                {Object.keys(budgets).map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
                <option value="new">+ Add New Category</option>
              </select>
            </div>
            
            {selectedBudgetCategory === 'new' && (
              <div>
                <Label>New Category Name</Label>
                <Input
                  value={selectedBudgetCategory === 'new' ? '' : selectedBudgetCategory || ''}
                  onChange={(e) => setSelectedBudgetCategory(e.target.value)}
                  placeholder="e.g., Marketing, Equipment Maintenance"
                />
              </div>
            )}
            
            <div>
              <Label>Budget Amount ($)</Label>
              <Input 
                type="number"
                min="0"
                step="0.01"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(parseFloat(e.target.value))}
                required
              />
            </div>
            
            <Button
              onClick={selectedBudgetCategory === 'new' 
                ? handleAddBudgetCategory 
                : handleUpdateBudget}
              className="w-full"
            >
              {selectedBudgetCategory === 'new' ? 'Add New Category' : 'Update Budget'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinancialPlanning;