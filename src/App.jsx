import { useState } from 'react';
import Papa from 'papaparse';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  AlertTriangle, ArrowDownRight, ArrowUpRight, Edit2, 
  ShieldCheck, Wallet, Upload 
} from 'lucide-react';

export default function App() {
  // ---------------- STATE MANAGEMENT ----------------
  // Enabled setters (setAccountBalance, setReceivedThisMonth, setSpentThisMonth)
  const [accountBalance, setAccountBalance] = useState(4500);
  const [receivedThisMonth, setReceivedThisMonth] = useState(6200);
  const [spentThisMonth, setSpentThisMonth] = useState(3100);

  // Scheduled Expenses State
  const [scheduledExpenses, setScheduledExpenses] = useState([
    { id: 1, name: 'House Rent', amount: 1800, dueDate: 'Oct 01', category: 'Housing' },
    { id: 2, name: 'Car Loan EMI', amount: 450, dueDate: 'Oct 05', category: 'Debt' },
    { id: 3, name: 'Health Insurance', amount: 250, dueDate: 'Oct 10', category: 'Insurance' },
    { id: 4, name: 'Wi-Fi & Utilities', amount: 150, dueDate: 'Oct 12', category: 'Utilities' },
  ]);

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);

  // Financial Health Factors
  const [emergencyFundMonths] = useState(4); 
  const [fixedExpenses] = useState(2650); 
  const [variableExpenses] = useState(450); 

  // ---------------- CSV FILE UPLOAD HANDLER ----------------
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        let income = 0;
        let expenses = 0;

        results.data.forEach((row) => {
          // Looks for 'Amount' or 'amount' column in your CSV
          const amount = parseFloat(row.Amount || row.amount || 0);
          if (amount > 0) {
            income += amount;
          } else {
            expenses += Math.abs(amount);
          }
        });

        // Update dashboard numbers with CSV data
        setReceivedThisMonth(income);
        setSpentThisMonth(expenses);
        setAccountBalance(income - expenses);
      },
    });
  };

  // ---------------- COMPUTED VALUES ----------------
  const totalScheduledSum = scheduledExpenses.reduce((sum, item) => sum + item.amount, 0);
  const isBalanceCritical = accountBalance < totalScheduledSum;

  const savingsRate = receivedThisMonth > 0 
    ? Math.max(0, ((receivedThisMonth - spentThisMonth) / receivedThisMonth) * 100)
    : 0;
  const savingsScore = Math.min(40, (savingsRate / 20) * 40);

  const fixedRatio = (fixedExpenses / (fixedExpenses + variableExpenses)) * 100;
  const ratioScore = fixedRatio <= 70 ? 30 : Math.max(0, 30 - (fixedRatio - 70));

  const emergencyScore = Math.min(30, (emergencyFundMonths / 6) * 30);
  const healthScore = Math.round(savingsScore + ratioScore + emergencyScore);

  const getHealthBadge = (score) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    if (score >= 60) return { label: 'Good', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
    if (score >= 40) return { label: 'Fair', color: 'text-amber-600 bg-amber-200' };
    return { label: 'Critical', color: 'text-rose-600 bg-rose-50 border-rose-200' };
  };

  const overviewData = [
    { name: 'Received', amount: receivedThisMonth, fill: '#10B981' },
    { name: 'Spent', amount: spentThisMonth, fill: '#F43F5E' },
    { name: 'Scheduled', amount: totalScheduledSum, fill: '#6366F1' },
  ];

  const healthBreakdownData = [
    { name: 'Savings Rate', score: Math.round(savingsScore), fill: '#10B981' },
    { name: 'Fixed/Var Ratio', score: Math.round(ratioScore), fill: '#6366F1' },
    { name: 'Emergency Fund', score: Math.round(emergencyScore), fill: '#F59E0B' },
  ];

  // ---------------- HANDLERS ----------------
  const handleEditClick = (expense) => {
    setCurrentExpense({ ...expense });
    setIsEditing(true);
  };

  const handleSaveExpense = (e) => {
    e.preventDefault();
    setScheduledExpenses(prev =>
      prev.map(item => item.id === currentExpense.id ? currentExpense : item)
    );
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* TOP HEADER */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-3xl font-extrabold text-indigo-600 tracking-tight">FinTrack</h1>
            <p className="text-sm text-slate-500 mt-1">Personal Income & Expense Intelligence Platform</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
            <Wallet className="w-5 h-5 text-indigo-600" />
            <div>
              <span className="text-xs text-slate-500 block">Tracked Account Balance</span>
              <span className="text-lg font-bold text-slate-800">${accountBalance.toLocaleString()}</span>
            </div>
          </div>
        </header>

        {/* CSV UPLOAD BOX */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Upload Bank Statement</h3>
              <p className="text-xs text-slate-500">Upload a .csv file containing an "Amount" column</p>
            </div>
          </div>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
        </div>

        {/* CRITICAL LOW BALANCE WARNING BANNER */}
        {isBalanceCritical && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl shadow-sm flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-rose-800">Warning: Insufficient Account Balance!</h3>
              <p className="text-sm text-rose-700 mt-0.5">
                Your current account balance (<span className="font-bold">${accountBalance.toLocaleString()}</span>) 
                is lower than your total upcoming scheduled expenses (<span className="font-bold">${totalScheduledSum.toLocaleString()}</span>).
              </p>
            </div>
          </div>
        )}

        {/* RECEIVED VS SPENT (MONTHLY OVERVIEW) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-slate-500">Received Money (This Month)</span>
              <h2 className="text-3xl font-extrabold text-emerald-600 mt-2">${receivedThisMonth.toLocaleString()}</h2>
              <span className="inline-flex items-center text-xs text-emerald-600 font-medium mt-2 bg-emerald-50 px-2 py-1 rounded-md">
                <ArrowUpRight className="w-4 h-4 mr-1" /> Tracked Income
              </span>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-slate-500">Money Spent (This Month)</span>
              <h2 className="text-3xl font-extrabold text-rose-600 mt-2">${spentThisMonth.toLocaleString()}</h2>
              <span className="inline-flex items-center text-xs text-rose-600 font-medium mt-2 bg-rose-50 px-2 py-1 rounded-md">
                <ArrowDownRight className="w-4 h-4 mr-1" /> Total Expenses
              </span>
            </div>
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
              <ArrowDownRight className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* SCHEDULED EXPENSES & FINANCIAL HEALTH */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Monthly Prescheduled Expenses</h3>
                <p className="text-xs text-slate-500">Total upcoming commitments: ${totalScheduledSum.toLocaleString()}</p>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-3 py-1 rounded-full border border-indigo-100">
                {scheduledExpenses.length} Items Scheduled
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {scheduledExpenses.map((expense) => (
                <div key={expense.id} className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">{expense.name}</h4>
                    <p className="text-xs text-slate-500">Due {expense.dueDate} • {expense.category}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-bold text-slate-800">${expense.amount.toLocaleString()}</span>
                    <button 
                      onClick={() => handleEditClick(expense)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title="Edit Scheduled Expense"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">Financial Health</h3>
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
              </div>

              <div className="mt-4 flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-xs text-slate-500 block">Overall Score</span>
                  <div className="text-4xl font-extrabold text-slate-800 mt-1">{healthScore}<span className="text-lg text-slate-400 font-normal">/100</span></div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getHealthBadge(healthScore).color}`}>
                  {getHealthBadge(healthScore).label}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="text-xs">
                  <div className="flex justify-between font-medium text-slate-700">
                    <span>Savings Rate ({Math.round(savingsRate)}%)</span>
                    <span>{Math.round(savingsScore)} / 40 pts</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-1 overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${(savingsScore / 40) * 100}%` }}></div>
                  </div>
                </div>

                <div className="text-xs">
                  <div className="flex justify-between font-medium text-slate-700">
                    <span>Fixed vs Variable Ratio</span>
                    <span>{Math.round(ratioScore)} / 30 pts</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-1 overflow-hidden">
                    <div className="bg-indigo-500 h-full" style={{ width: `${(ratioScore / 30) * 100}%` }}></div>
                  </div>
                </div>

                <div className="text-xs">
                  <div className="flex justify-between font-medium text-slate-700">
                    <span>Emergency Reserve ({emergencyFundMonths} mos)</span>
                    <span>{Math.round(emergencyScore)} / 30 pts</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-1 overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: `${(emergencyScore / 30) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-4 italic">
              *Calculated using savings rate, fixed-to-variable expense balance, and emergency fund status.
            </p>
          </div>
        </div>

        {/* VISUAL GRAPH REPRESENTATION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Monthly Financial Overview</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overviewData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip 
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {overviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Financial Health Pillar Breakdown</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={healthBreakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 40]} tickLine={false} axisLine={false} />
                  <Tooltip 
                    formatter={(value) => [`${value} Points`, 'Score']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                  />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                    {healthBreakdownData.map((entry, index) => (
                      <Cell key={`health-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* EDIT EXPENSE MODAL */}
        {isEditing && currentExpense && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Edit Scheduled Expense</h3>
              <form onSubmit={handleSaveExpense} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Expense Name</label>
                  <input 
                    type="text"
                    value={currentExpense.name}
                    onChange={(e) => setCurrentExpense({ ...currentExpense, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Amount ($)</label>
                  <input 
                    type="number"
                    value={currentExpense.amount}
                    onChange={(e) => setCurrentExpense({ ...currentExpense, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Due Date</label>
                  <input 
                    type="text"
                    value={currentExpense.dueDate}
                    onChange={(e) => setCurrentExpense({ ...currentExpense, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="w-1/2 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="w-1/2 py-2 text-sm text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition font-semibold"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}